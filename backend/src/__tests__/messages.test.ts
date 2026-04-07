jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, m } from './helpers';

const brokerHeaders = authHeader('broker-1', 'BROKER');

const mockMessage = {
  id: 'msg-1',
  loanId: 'loan-1',
  senderId: 'broker-1',
  body: 'Hello there',
  sentAt: new Date(),
  sender: { id: 'broker-1', firstName: 'Bob', role: 'BROKER' },
};

describe('GET /api/loans/:loanId/messages', () => {
  test('returns messages and marks notifications read', async () => {
    m(prisma.message.findMany).mockResolvedValue([mockMessage]);
    m(prisma.notification.updateMany).mockResolvedValue({ count: 0 });

    const res = await request(app).get('/api/loans/loan-1/messages').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
    expect(res.body.messages[0].body).toBe('Hello there');
    expect(m(prisma.notification.updateMany)).toHaveBeenCalled();
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/loans/loan-1/messages');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/loans/:loanId/messages', () => {
  test('creates message and notifies other parties', async () => {
    m(prisma.message.create).mockResolvedValue(mockMessage);
    m(prisma.loan.findUnique).mockResolvedValue({ brokerId: 'broker-1', assignedUwId: 'uw-1' });
    m(prisma.notification.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/messages')
      .set(brokerHeaders)
      .send({ body: 'Hello there' });

    expect(res.status).toBe(201);
    expect(res.body.body).toBe('Hello there');
    expect(m(prisma.notification.create)).toHaveBeenCalledTimes(1); // notifies uw-1 only (not broker-1 themselves)
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/messages')
      .set(brokerHeaders)
      .send({ body: '   ' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when body missing', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/messages')
      .set(brokerHeaders)
      .send({});
    expect(res.status).toBe(400);
  });

  test('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/messages')
      .send({ body: 'Hi' });
    expect(res.status).toBe(401);
  });
});
