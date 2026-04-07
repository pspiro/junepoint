import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/loans/:loanId/closing
router.get('/:loanId/closing', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;

  let checklist = await prisma.closingChecklist.findUnique({ where: { loanId } });
  if (!checklist) {
    checklist = await prisma.closingChecklist.create({ data: { loanId } });
  }

  const loan = await prisma.loan.findUnique({ where: { id: loanId }, select: { fundedAt: true, wireAmount: true, wireDate: true, wireReference: true } });

  return res.json({
    ...checklist,
    wireConfirmed: !!loan?.wireAmount,
    recordingComplete: !!loan?.wireDate,
    fundedAt: loan?.fundedAt,
  });
});

// POST /api/loans/:loanId/closing/ctc
router.post('/:loanId/closing/ctc', requireAuth, requireRole('TITLE', 'ADMIN'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { item, status, linkedDocId } = req.body;

  // Map item name to checklist column
  const fieldMap: Record<string, string> = {
    appraisal_received: 'appraisalReceived',
    title_commitment: 'titleCommitment',
    insurance_binder: 'insuranceBinder',
    flood_cert: 'floodCert',
    survey: 'survey',
    loan_docs_signed: 'loanDocsSigned',
    wire_confirmed: 'wireConfirmed',
    recording_confirmed: 'recordingConfirmed',
  };

  const field = fieldMap[item];
  if (field) {
    const updated = await prisma.closingChecklist.upsert({
      where: { loanId },
      create: { loanId, [field]: status },
      update: { [field]: status },
    });
    return res.json(updated);
  }

  // Custom item
  const checklist = await prisma.closingChecklist.upsert({
    where: { loanId },
    create: { loanId },
    update: {},
  });

  const customItems = (checklist.customItems as any[]) || [];
  customItems.push({ id: Date.now().toString(), item, status, linkedDocId });

  const updated = await prisma.closingChecklist.update({
    where: { loanId },
    data: { customItems },
  });
  return res.json(updated);
});

// POST /api/loans/:loanId/closing/fund
router.post('/:loanId/closing/fund', requireAuth, requireRole('TITLE'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { wireAmount, wireDate, wireReference } = req.body;
  if (!wireAmount || !wireDate || !wireReference) {
    return res.status(400).json({ error: 'wireAmount, wireDate, wireReference required' });
  }

  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.status !== 'IN_CLOSING') return res.status(400).json({ error: 'Loan must be IN_CLOSING to fund' });

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: { status: 'CLOSED', fundedAt: new Date(), wireAmount, wireDate: new Date(wireDate), wireReference },
  });

  await prisma.loanEvent.create({
    data: { loanId, actorId: req.user!.id, actorType: 'USER', eventType: 'LOAN_FUNDED', fromStatus: 'IN_CLOSING', toStatus: 'CLOSED', payload: { wireAmount, wireDate, wireReference } },
  });

  return res.json({ ...updated, loanAmount: Number(updated.loanAmount), wireAmount: wireAmount });
});

export default router;
