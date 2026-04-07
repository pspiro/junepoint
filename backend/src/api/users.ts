import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, cognitoSub, ...rest } = user;
  return res.json(rest);
});

// PUT /api/users/me
router.put('/me', requireAuth, async (req: Request, res: Response) => {
  const { firstName, lastName, companyName, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { firstName, lastName, companyName, phone },
  });
  const { passwordHash, cognitoSub, ...rest } = user;
  return res.json(rest);
});

// GET /api/users  (Admin only)
router.get('/', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { role, isActive, page = '1', limit = '25' } = req.query as Record<string, string>;
  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const sanitized = users.map(({ passwordHash, cognitoSub, ...u }) => u);
  return res.json({ users: sanitized, total, page: Number(page) });
});

// POST /api/users  (Admin only)
router.post('/', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { email, firstName, lastName, role, companyName } = req.body;
  if (!email || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'email, firstName, lastName, role required' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  // Generate a temporary password
  const tempPass = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(tempPass, 12);

  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, firstName, lastName, role, companyName, mfaEnabled: ['UNDERWRITER', 'TITLE', 'ADMIN'].includes(role) },
  });
  const { passwordHash: _, cognitoSub, ...rest } = user;
  return res.status(201).json({ ...rest, tempPassword: tempPass });
});

// GET /api/users/:userId
router.get('/:userId', requireAuth, async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (req.user!.role !== 'ADMIN' && req.user!.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, cognitoSub, ...rest } = user;
  return res.json(rest);
});

// PUT /api/users/:userId  (Admin only)
router.put('/:userId', requireAuth, requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName, companyName, phone, isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, companyName, phone, isActive },
  });
  const { passwordHash, cognitoSub, ...rest } = user;
  return res.json(rest);
});

// POST /api/users/invite  (Broker invites borrower)
router.post('/invite', requireAuth, requireRole('BROKER'), async (req: Request, res: Response) => {
  const { email, firstName, lastName, loanId } = req.body;
  if (!email || !firstName || !lastName || !loanId) {
    return res.status(400).json({ error: 'email, firstName, lastName, loanId required' });
  }

  let borrower = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!borrower) {
    borrower = await prisma.user.create({
      data: { email: email.toLowerCase(), firstName, lastName, role: 'BORROWER' },
    });
  }

  // Create borrower profile for this loan if not exists
  await prisma.borrowerProfile.upsert({
    where: { loanId_userId: { loanId, userId: borrower.id } },
    create: { loanId, userId: borrower.id },
    update: {},
  });

  // Update loan with borrowerId
  await prisma.loan.update({ where: { id: loanId }, data: { borrowerId: borrower.id } });

  // Generate magic link token
  const magicToken = jwt.sign(
    { sub: borrower.id, type: 'magic' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  // In production this would send an email; in local dev just return the token
  console.log(`Magic link for ${email}: ${process.env.FRONTEND_URL}/magic/${magicToken}`);

  return res.json({ borrowerId: borrower.id, inviteSent: true, magicToken });
});

export default router;
