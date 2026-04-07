import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/loans/:loanId/messages
router.get('/:loanId/messages', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const messages = await prisma.message.findMany({
    where: { loanId },
    orderBy: { sentAt: 'asc' },
    include: { sender: { select: { id: true, firstName: true, role: true } } },
  });

  // Mark messages as read for the current user
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, loanId, type: 'NEW_MESSAGE', isRead: false },
    data: { isRead: true },
  });

  return res.json({ messages });
});

// POST /api/loans/:loanId/messages
router.post('/:loanId/messages', requireAuth, async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'body required' });

  const message = await prisma.message.create({
    data: { loanId, senderId: req.user!.id, body },
    include: { sender: { select: { id: true, firstName: true, role: true } } },
  });

  // Create notifications for other parties
  const loan = await prisma.loan.findUnique({ where: { id: loanId }, select: { brokerId: true, assignedUwId: true } });
  if (loan) {
    const notifyIds = [loan.brokerId, loan.assignedUwId].filter(id => id && id !== req.user!.id) as string[];
    for (const userId of notifyIds) {
      await prisma.notification.create({
        data: { userId, loanId, type: 'NEW_MESSAGE', title: 'New message', body: body.substring(0, 100) },
      });
    }
  }

  return res.status(201).json(message);
});

export default router;
