import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/marketplace
router.get('/marketplace', requireAuth, requireRole('INVESTOR', 'ADMIN'), async (req: Request, res: Response) => {
  const { program, minAmount, maxAmount, page = '1', limit = '25' } = req.query as Record<string, string>;

  const where: Record<string, unknown> = { soldAt: null };
  if (program) where.loan = { program };

  const [listings, total] = await Promise.all([
    prisma.investorListing.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { listedAt: 'desc' },
      include: { loan: { select: { program: true, loanAmount: true, ltv: true, dscr: true, propertyState: true, status: true } } },
    }),
    prisma.investorListing.count({ where }),
  ]);

  const now = Date.now();
  const serialized = listings.map(l => ({
    id: l.id,
    loanId: l.loanId,
    program: l.loan.program,
    amount: Number(l.loan.loanAmount),
    ltv: l.loan.ltv ? Number(l.loan.ltv) : null,
    yield: Number(l.yield),
    aiSummary: l.aiSummary,
    matchScore: Math.floor(Math.random() * 30) + 70, // mock match score
    daysOnMarket: Math.floor((now - l.listedAt.getTime()) / 86400000),
    askingPrice: Number(l.askingPrice),
    listedAt: l.listedAt,
  }));

  return res.json({ listings: serialized, total });
});

// GET /api/marketplace/:loanId
router.get('/marketplace/:loanId', requireAuth, requireRole('INVESTOR', 'ADMIN'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const listing = await prisma.investorListing.findUnique({
    where: { loanId },
    include: { loan: true, bids: { where: { investorId: req.user!.id } } },
  });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  return res.json({
    ...listing,
    askingPrice: Number(listing.askingPrice),
    yield: Number(listing.yield),
    loan: { ...listing.loan, loanAmount: Number(listing.loan.loanAmount) },
  });
});

// POST /api/marketplace/:loanId/bid
router.post('/marketplace/:loanId/bid', requireAuth, requireRole('INVESTOR'), async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { bidAmount, terms } = req.body;
  if (!bidAmount) return res.status(400).json({ error: 'bidAmount required' });

  const listing = await prisma.investorListing.findUnique({ where: { loanId } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const bid = await prisma.investorBid.create({
    data: { listingId: listing.id, investorId: req.user!.id, bidAmount, terms },
  });
  return res.status(201).json({ ...bid, bidAmount: Number(bid.bidAmount) });
});

// GET /api/portfolio
router.get('/portfolio', requireAuth, requireRole('INVESTOR'), async (req: Request, res: Response) => {
  const bids = await prisma.investorBid.findMany({
    where: { investorId: req.user!.id, status: 'ACCEPTED' },
    include: { listing: { include: { loan: true } } },
  });

  const loans = bids.map(b => ({
    ...b.listing.loan,
    loanAmount: Number(b.listing.loan.loanAmount),
    bidAmount: Number(b.bidAmount),
  }));

  const totalDeployed = bids.reduce((sum, b) => sum + Number(b.bidAmount), 0);
  const summary = { totalDeployed, interestEarned: totalDeployed * 0.08, activeCount: bids.length };

  return res.json({ loans, summary });
});

// GET /api/investor/criteria
router.get('/criteria', requireAuth, requireRole('INVESTOR'), async (req: Request, res: Response) => {
  const criteria = await prisma.investorCriteria.findUnique({ where: { investorId: req.user!.id } });
  return res.json(criteria || { investorId: req.user!.id });
});

// PUT /api/investor/criteria
router.put('/criteria', requireAuth, requireRole('INVESTOR'), async (req: Request, res: Response) => {
  const { programs, minAmount, maxAmount, maxLtv, minYield, states } = req.body;
  const criteria = await prisma.investorCriteria.upsert({
    where: { investorId: req.user!.id },
    create: { investorId: req.user!.id, programs, minAmount, maxAmount, maxLtv, minYield, states },
    update: { programs, minAmount, maxAmount, maxLtv, minYield, states },
  });
  return res.json(criteria);
});

export default router;
