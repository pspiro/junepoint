import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

// POST /api/documents/presigned-url  (returns a local upload URL in dev)
router.post('/presigned-url', requireAuth, async (req: Request, res: Response) => {
  const { loanId, fileName, contentType, fileSize } = req.body;
  if (!loanId || !fileName) return res.status(400).json({ error: 'loanId and fileName required' });

  const documentId = uuidv4();
  const key = `loans/${loanId}/${documentId}/${fileName}`;

  // Create PENDING document record
  await prisma.document.create({
    data: {
      id: documentId,
      loanId,
      uploadedBy: req.user!.id,
      fileName,
      s3Key: key,
      s3Bucket: process.env.DOCUMENTS_BUCKET || 'capitalflow-documents-dev',
      contentType,
      fileSize: fileSize ? BigInt(fileSize) : undefined,
      status: 'PENDING',
    },
  });

  // In local dev, return an upload URL pointing to our own endpoint
  const uploadUrl = `http://localhost:${process.env.PORT || 3001}/api/documents/upload/${documentId}`;
  return res.json({ uploadUrl, documentId, key });
});

// POST /api/documents/upload/:documentId  (local file upload - replaces S3 presigned PUT)
router.post('/upload/:documentId', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  const { documentId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  // Store the local file path in s3Key for dev purposes
  const localPath = req.file.path;
  await prisma.document.update({
    where: { id: documentId },
    data: { s3Key: localPath, status: 'PROCESSING' },
  });

  return res.json({ ok: true, documentId });
});

// POST /api/loans/:loanId/documents  (confirm upload)
router.post('/:loanId/documents', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { documentId } = req.body;

  const doc = await prisma.document.findFirst({ where: { id: documentId, loanId } });
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'ACCEPTED', // In local dev, auto-accept
      aiClassification: guessDocType(doc.fileName),
      aiConfidence: 0.87,
      processedAt: new Date(),
    },
  });

  await prisma.loanEvent.create({
    data: { loanId, actorId: req.user!.id, actorType: 'USER', eventType: 'DOCUMENT_UPLOADED', payload: { documentId, fileName: doc.fileName } },
  });

  return res.json({ ...updated, fileSize: updated.fileSize ? Number(updated.fileSize) : null });
});

// GET /api/loans/:loanId/documents
router.get('/:loanId/documents', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { search } = req.query as Record<string, string>;

  const where: Record<string, unknown> = { loanId };
  // Full-text search not implemented for local dev (would use tsvector in prod)

  const docs = await prisma.document.findMany({
    where,
    orderBy: { uploadedAt: 'desc' },
  });

  const serialized = docs.map(d => ({ ...d, fileSize: d.fileSize ? Number(d.fileSize) : null }));
  return res.json({ documents: serialized });
});

// GET /api/loans/:loanId/documents/:docId
router.get('/:loanId/documents/:docId', requireAuth, async (req: Request, res: Response) => {
  const { loanId, docId } = req.params;
  const doc = await prisma.document.findFirst({ where: { id: docId, loanId } });
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  // In local dev, downloadUrl points to a local serve endpoint
  const downloadUrl = `http://localhost:${process.env.PORT || 3001}/api/documents/file/${docId}`;
  return res.json({ ...doc, fileSize: doc.fileSize ? Number(doc.fileSize) : null, downloadUrl });
});

// PUT /api/loans/:loanId/documents/:docId
router.put('/:loanId/documents/:docId', requireAuth, requireRole('UNDERWRITER', 'ADMIN'), async (req: Request, res: Response) => {
  const { docId } = req.params;
  const { docType, status, rejectionReason } = req.body;
  const updated = await prisma.document.update({
    where: { id: docId },
    data: { docType, status, rejectionReason },
  });
  return res.json({ ...updated, fileSize: updated.fileSize ? Number(updated.fileSize) : null });
});

// GET /api/documents  (broker cross-loan view)
router.get('/', requireAuth, requireRole('BROKER', 'ADMIN'), async (req: Request, res: Response) => {
  const { loanId, docType, page = '1', limit = '25' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = {};
  if (req.user!.role === 'BROKER') {
    // Filter to broker's loans
    const brokerLoans = await prisma.loan.findMany({ where: { brokerId: req.user!.id }, select: { id: true } });
    where.loanId = { in: brokerLoans.map(l => l.id) };
  }
  if (loanId) where.loanId = loanId;
  if (docType) where.docType = docType;

  const [docs, total] = await Promise.all([
    prisma.document.findMany({ where, skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { uploadedAt: 'desc' } }),
    prisma.document.count({ where }),
  ]);

  const serialized = docs.map(d => ({ ...d, fileSize: d.fileSize ? Number(d.fileSize) : null }));
  return res.json({ documents: serialized, total });
});

// GET /api/documents/file/:docId  (serve local file in dev)
router.get('/file/:docId', requireAuth, async (req: Request, res: Response) => {
  const { docId } = req.params;
  const doc = await prisma.document.findUnique({ where: { id: docId } });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (fs.existsSync(doc.s3Key)) {
    return res.sendFile(path.resolve(doc.s3Key));
  }
  return res.status(404).json({ error: 'File not found on disk' });
});

function guessDocType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes('w2') || lower.includes('w-2')) return 'W-2';
  if (lower.includes('1040') || lower.includes('tax')) return 'Personal Tax Return (1040)';
  if (lower.includes('paystub') || lower.includes('pay stub')) return 'Pay Stub';
  if (lower.includes('bank') || lower.includes('statement')) return 'Bank Statement';
  if (lower.includes('appraisal')) return 'Appraisal Report';
  if (lower.includes('purchase') || lower.includes('contract')) return 'Purchase Agreement';
  if (lower.includes('title')) return 'Title Commitment';
  if (lower.includes('insurance') || lower.includes('binder')) return 'Insurance Binder';
  return 'Other';
}

export default router;
