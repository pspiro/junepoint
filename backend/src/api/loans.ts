import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

function generateLoanNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `CF-${year}-${num}`;
}

function serializeLoan(loan: any) {
  return {
    ...loan,
    loanAmount: loan.loanAmount ? Number(loan.loanAmount) : undefined,
    ltv: loan.ltv ? Number(loan.ltv) : undefined,
    interestRate: loan.interestRate ? Number(loan.interestRate) : undefined,
    propertyValue: loan.propertyValue ? Number(loan.propertyValue) : undefined,
    monthlyRent: loan.monthlyRent ? Number(loan.monthlyRent) : undefined,
    dscr: loan.dscr ? Number(loan.dscr) : undefined,
    wireAmount: loan.wireAmount ? Number(loan.wireAmount) : undefined,
  };
}

// GET /api/loans
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { status, program, page = '1', limit = '25', sortBy = 'createdAt', sortDir = 'desc' } = req.query as Record<string, string>;
  const where: Record<string, unknown> = {};

  const { role, id } = req.user!;
  if (role === 'BROKER') where.brokerId = id;
  else if (role === 'BORROWER') where.borrowerId = id;
  else if (role === 'UNDERWRITER') where.assignedUwId = id;
  // ADMIN, TITLE, INVESTOR see all (with their own filters)

  if (status) where.status = status;
  if (program) where.program = program;

  const [loans, total] = await Promise.all([
    prisma.loan.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { [sortBy]: sortDir },
      include: { broker: { select: { firstName: true, lastName: true, email: true } }, borrower: { select: { firstName: true, lastName: true, email: true } } },
    }),
    prisma.loan.count({ where }),
  ]);

  return res.json({ loans: loans.map(serializeLoan), total });
});

// POST /api/loans
router.post('/', requireAuth, requireRole('BROKER'), async (req: Request, res: Response) => {
  const { program, loanAmount, purpose, propertyAddress, propertyCity, propertyState, propertyZip, propertyType, propertyValue, borrowerId } = req.body;
  if (!program || !loanAmount) return res.status(400).json({ error: 'program and loanAmount required' });

  let loanNumber = generateLoanNumber();
  // Ensure uniqueness
  while (await prisma.loan.findUnique({ where: { loanNumber } })) {
    loanNumber = generateLoanNumber();
  }

  const loan = await prisma.loan.create({
    data: { loanNumber, brokerId: req.user!.id, program, loanAmount, purpose, propertyAddress, propertyCity, propertyState, propertyZip, propertyType, propertyValue, borrowerId },
  });

  await prisma.loanEvent.create({
    data: { loanId: loan.id, actorId: req.user!.id, actorType: 'USER', eventType: 'LOAN_CREATED', toStatus: 'DRAFT' },
  });

  return res.status(201).json(serializeLoan(loan));
});

// GET /api/loans/:loanId
router.get('/:loanId', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      broker: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      borrower: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedUw: { select: { id: true, firstName: true, lastName: true } },
      borrowerProfiles: true,
      conditions: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const { role, id } = req.user!;
  if (role === 'BROKER' && loan.brokerId !== id) return res.status(403).json({ error: 'Forbidden' });
  if (role === 'BORROWER' && loan.borrowerId !== id) return res.status(403).json({ error: 'Forbidden' });

  return res.json(serializeLoan(loan));
});

// PUT /api/loans/:loanId
router.put('/:loanId', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const { role, id } = req.user!;
  if (role === 'BROKER' && (loan.brokerId !== id || loan.status !== 'DRAFT')) {
    return res.status(403).json({ error: 'Brokers can only edit DRAFT loans' });
  }

  const updated = await prisma.loan.update({ where: { id: loanId }, data: req.body });
  return res.json(serializeLoan(updated));
});

// POST /api/loans/:loanId/submit
router.post('/:loanId/submit', requireAuth, requireRole('BROKER'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  if (loan.brokerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  if (loan.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT loans can be submitted' });

  const updated = await prisma.loan.update({ where: { id: loanId }, data: { status: 'SUBMITTED' } });

  await prisma.loanEvent.create({
    data: { loanId, actorId: req.user!.id, actorType: 'USER', eventType: 'STATUS_CHANGE', fromStatus: 'DRAFT', toStatus: 'SUBMITTED' },
  });

  // In production: enqueue SQS COMPLETENESS_CHECK message
  // In local dev: create a mock AI analysis
  await prisma.aIAnalysis.create({
    data: {
      loanId,
      analysisType: 'COMPLETENESS',
      modelId: 'claude-sonnet-4-20250514',
      inputSnapshot: { loanId, status: 'SUBMITTED' },
      outputRaw: 'Completeness check completed. Loan file is 78% complete.',
      scores: { completeness: 78 },
      recommendation: 'MANUAL_REVIEW',
      reasoning: 'Missing borrower financial documents. Property appraisal pending.',
    },
  });

  await prisma.loan.update({ where: { id: loanId }, data: { aiCompletenessScore: 78, aiRecommendation: 'MANUAL_REVIEW' } });

  return res.json({ loanId, status: 'SUBMITTED' });
});

// POST /api/loans/:loanId/events
router.post('/:loanId/events', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { transition, note } = req.body;
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  const validTransitions: Record<string, string[]> = {
    'SUBMITTED->IN_REVIEW': ['ADMIN', 'UNDERWRITER'],
    'IN_REVIEW->CONDITIONALLY_APPROVED': ['UNDERWRITER'],
    'IN_REVIEW->APPROVED': ['UNDERWRITER'],
    'IN_REVIEW->DECLINED': ['UNDERWRITER'],
    'IN_REVIEW->SUSPENDED': ['UNDERWRITER'],
    'CONDITIONALLY_APPROVED->APPROVED': ['UNDERWRITER'],
    'APPROVED->IN_CLOSING': ['ADMIN', 'UNDERWRITER'],
    'IN_CLOSING->CLOSED': ['TITLE'],
    'CLOSED->ON_MARKET': ['ADMIN'],
    'ON_MARKET->SOLD': ['ADMIN'],
  };

  const key = `${loan.status}->${transition}`;
  const allowedRoles = validTransitions[key];
  if (!allowedRoles) return res.status(400).json({ error: `Invalid transition: ${key}` });
  if (!allowedRoles.includes(req.user!.role)) return res.status(403).json({ error: 'Not authorized for this transition' });

  const updated = await prisma.loan.update({ where: { id: loanId }, data: { status: transition as any } });

  await prisma.loanEvent.create({
    data: { loanId, actorId: req.user!.id, actorType: 'USER', eventType: 'STATUS_CHANGE', fromStatus: loan.status, toStatus: transition as any, payload: { note } },
  });

  return res.json(serializeLoan(updated));
});

// POST /api/loans/:loanId/assign
router.post('/:loanId/assign', requireAuth, requireRole('ADMIN', 'UNDERWRITER'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { underwriterId } = req.body;

  const uw = await prisma.user.findFirst({ where: { id: underwriterId, role: 'UNDERWRITER' } });
  if (!uw) return res.status(400).json({ error: 'Underwriter not found' });

  const updated = await prisma.loan.update({ where: { id: loanId }, data: { assignedUwId: underwriterId, status: 'IN_REVIEW' } });

  await prisma.loanEvent.create({
    data: { loanId, actorId: req.user!.id, actorType: 'USER', eventType: 'LOAN_ASSIGNED', payload: { underwriterId } },
  });

  return res.json(serializeLoan(updated));
});

// GET /api/loans/:loanId/events
router.get('/:loanId/events', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const events = await prisma.loanEvent.findMany({
    where: { loanId },
    orderBy: { createdAt: 'asc' },
    include: { actor: { select: { firstName: true, lastName: true, role: true } } },
  });
  return res.json({ events });
});

export default router;
