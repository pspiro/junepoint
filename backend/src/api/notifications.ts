import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// SSE clients map: userId -> Response[]
const sseClients = new Map<string, Response[]>();

export function pushNotification(userId: string, notification: object) {
  const clients = sseClients.get(userId) || [];
  const data = JSON.stringify({ type: 'NEW_NOTIFICATION', data: notification });
  clients.forEach(res => {
    try { res.write(`data: ${data}\n\n`); } catch { /* client disconnected */ }
  });
}

// GET /api/notifications/stream  (SSE)
router.get('/stream', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.id;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.flushHeaders();

  // Send a heartbeat every 30s
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
  }, 30000);

  // Register client
  const clients = sseClients.get(userId) || [];
  clients.push(res);
  sseClients.set(userId, clients);

  req.on('close', () => {
    clearInterval(heartbeat);
    const remaining = (sseClients.get(userId) || []).filter(c => c !== res);
    if (remaining.length === 0) sseClients.delete(userId);
    else sseClients.set(userId, remaining);
  });
});

// GET /api/notifications
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { unreadOnly, page = '1', limit = '25' } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { userId: req.user!.id };
  if (unreadOnly === 'true') where.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  return res.json({ notifications, unreadCount });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.id },
    data: { isRead: true },
  });
  return res.json({ ok: true });
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true },
  });
  return res.json({ ok: true });
});

export default router;
