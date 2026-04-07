import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/loans/:loanId/underwriting
router.get('/:loanId/underwriting', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const [aiAnalyses, conditions] = await Promise.all([
    prisma.aIAnalysis.findMany({ where: { loanId }, orderBy: { createdAt: 'desc' } }),
    prisma.condition.findMany({ where: { loanId }, orderBy: { createdAt: 'asc' } }),
  ]);

  const decision = loan.creditDecision ? {
    outcome: loan.creditDecision,
    creditMemo: loan.creditMemo,
    decidedBy: loan.decidedBy,
    decidedAt: loan.decidedAt,
  } : undefined;

  return res.json({ aiAnalyses, conditions, decision });
});

// POST /api/loans/:loanId/underwriting/decision
router.post('/:loanId/underwriting/decision', requireAuth, requireRole('UNDERWRITER'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { outcome, creditMemo, conditionIds, aiOverrideReason } = req.body;

  if (!outcome || !creditMemo) return res.status(400).json({ error: 'outcome and creditMemo required' });

  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const newStatus = outcome === 'APPROVED' ? 'APPROVED'
    : outcome === 'CONDITIONALLY_APPROVED' ? 'CONDITIONALLY_APPROVED'
    : outcome === 'DECLINED' ? 'DECLINED'
    : 'SUSPENDED';

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: {
      creditDecision: outcome,
      creditMemo,
      decidedBy: req.user!.id,
      decidedAt: new Date(),
      aiOverrideReason,
      status: newStatus as any,
    },
  });

  await prisma.loanEvent.create({
    data: {
      loanId,
      actorId: req.user!.id,
      actorType: 'USER',
      eventType: 'DECISION_ISSUED',
      fromStatus: loan.status,
      toStatus: newStatus as any,
      payload: { outcome, aiOverrideReason },
    },
  });

  // Log AI override if applicable
  if (aiOverrideReason) {
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'AI_OVERRIDE', resource: 'loan', resourceId: loanId, payload: { aiOverrideReason, outcome } },
    });
  }

  return res.json({ ...updated, loanAmount: Number(updated.loanAmount) });
});

// GET /api/loans/:loanId/conditions
router.get('/:loanId/conditions', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const conditions = await prisma.condition.findMany({
    where: { loanId },
    orderBy: { createdAt: 'asc' },
    include: { creator: { select: { firstName: true, lastName: true } } },
  });
  return res.json({ conditions });
});

// POST /api/loans/:loanId/conditions
router.post('/:loanId/conditions', requireAuth, requireRole('UNDERWRITER', 'ADMIN'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { type, description, responsibleParty, dueDate } = req.body;
  if (!type || !description || !responsibleParty) return res.status(400).json({ error: 'type, description, responsibleParty required' });

  const condition = await prisma.condition.create({
    data: { loanId, createdBy: req.user!.id, type, description, responsibleParty, dueDate: dueDate ? new Date(dueDate) : undefined },
  });
  return res.status(201).json(condition);
});

// PUT /api/loans/:loanId/conditions/:condId
router.put('/:loanId/conditions/:condId', requireAuth, async (req: Request, res: Response) => {
  const { condId } = req.params;
  const { status, linkedDocId } = req.body;

  const condition = await prisma.condition.update({
    where: { id: condId },
    data: {
      status,
      linkedDocId,
      satisfiedBy: status === 'SATISFIED' ? req.user!.id : undefined,
      satisfiedAt: status === 'SATISFIED' ? new Date() : undefined,
    },
  });
  return res.json(condition);
});

export default router;
