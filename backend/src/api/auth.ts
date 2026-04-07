import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

function signTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600 }
  );
  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    process.env.JWT_SECRET!,
    { expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) || 2592000 }
  );
  return { accessToken, refreshToken };
}

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.isActive) {
    return res.status(403).json({ error: 'Account deactivated' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = signTokens(user);
  return res.json({
    accessToken,
    refreshToken,
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (_req: Request, res: Response) => {
  // In a full implementation, invalidate the refresh token in a blocklist
  return res.json({ ok: true });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { sub: string; type: string };
    if (payload.type !== 'refresh') return res.status(401).json({ error: 'Invalid token type' });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found or inactive' });

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600 }
    );
    return res.json({ accessToken, expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600 });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/magic-link  (borrower magic link)
router.post('/magic-link', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; type: string };
    if (payload.type !== 'magic') return res.status(401).json({ error: 'Invalid token' });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid magic link' });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const { accessToken, refreshToken } = signTokens(user);
    return res.json({
      accessToken,
      refreshToken,
      expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired magic link' });
  }
});

// POST /api/auth/register  (broker self-registration)
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, companyName, phone } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'email, password, firstName, lastName required' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      role: 'BROKER',
      companyName,
      phone,
    },
  });

  const { accessToken, refreshToken } = signTokens(user);
  return res.status(201).json({
    accessToken,
    refreshToken,
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (_req: Request, res: Response) => {
  // In local dev, just return ok (no real email)
  return res.json({ ok: true });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

export default router;
