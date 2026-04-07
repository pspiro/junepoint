jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, m } from './helpers';

const brokerHeaders = authHeader('broker-1', 'BROKER');

const mockNotification = {
  id: 'notif-1',
  userId: 'broker-1',
  loanId: 'loan-1',
  type: 'LOAN_STATUS_CHANGE',
  title: 'Loan submitted',
  body: 'Your loan has been submitted.',
  isRead: false,
  createdAt: new Date(),
};

describe('GET /api/notifications', () => {
  test('returns notifications with unread count', async () => {
    m(prisma.notification.findMany).mockResolvedValue([mockNotification]);
    m(prisma.notification.count).mockResolvedValue(1);

    const res = await request(app).get('/api/notifications').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(1);
    expect(res.body.unreadCount).toBe(1);
  });

  test('returns only unread when unreadOnly=true', async () => {
    m(prisma.notification.findMany).mockResolvedValue([mockNotification]);
    m(prisma.notification.count).mockResolvedValue(1);

    const res = await request(app)
      .get('/api/notifications?unreadOnly=true')
      .set(brokerHeaders);

    expect(res.status).toBe(200);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/notifications/:id/read', () => {
  test('marks notification as read', async () => {
    m(prisma.notification.updateMany).mockResolvedValue({ count: 1 });

    const res = await request(app)
      .put('/api/notifications/notif-1/read')
      .set(brokerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(m(prisma.notification.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 'notif-1', userId: 'broker-1' }) })
    );
  });

  test('returns 401 without token', async () => {
    const res = await request(app).put('/api/notifications/notif-1/read');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/notifications/read-all', () => {
  test('marks all notifications as read', async () => {
    m(prisma.notification.updateMany).mockResolvedValue({ count: 5 });

    const res = await request(app)
      .put('/api/notifications/read-all')
      .set(brokerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(m(prisma.notification.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'broker-1', isRead: false }) })
    );
  });
});

describe('GET /api/notifications/stream', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/notifications/stream');
    expect(res.status).toBe(401);
  });
});
