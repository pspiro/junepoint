jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, mockLoan, m } from './helpers';

const brokerHeaders = authHeader('broker-1', 'BROKER');
const adminHeaders = authHeader('admin-1', 'ADMIN');
const uwHeaders = authHeader('uw-1', 'UNDERWRITER');

describe('GET /api/loans/:loanId/underwriting', () => {
  test('returns underwriting summary', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(mockLoan);
    m(prisma.aIAnalysis.findMany).mockResolvedValue([]);
    m(prisma.condition.findMany).mockResolvedValue([]);

    const res = await request(app).get('/api/loans/loan-1/underwriting').set(uwHeaders);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('aiAnalyses');
    expect(res.body).toHaveProperty('conditions');
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app).get('/api/loans/nonexistent/underwriting').set(uwHeaders);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/loans/:loanId/underwriting/decision', () => {
  test('underwriter issues decision', async () => {
    const decidedLoan = { ...mockLoan, creditDecision: 'APPROVED', status: 'APPROVED' };
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'IN_REVIEW' });
    m(prisma.loan.update).mockResolvedValue(decidedLoan);
    m(prisma.loanEvent.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/underwriting/decision')
      .set(uwHeaders)
      .send({ outcome: 'APPROVED', creditMemo: 'Loan looks good.' });

    expect(res.status).toBe(200);
    expect(res.body.creditDecision).toBe('APPROVED');
  });

  test('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/underwriting/decision')
      .set(uwHeaders)
      .send({ outcome: 'APPROVED' });
    expect(res.status).toBe(400);
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/loans/nonexistent/underwriting/decision')
      .set(uwHeaders)
      .send({ outcome: 'APPROVED', creditMemo: 'ok' });
    expect(res.status).toBe(404);
  });

  test('non-underwriter gets 403', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/underwriting/decision')
      .set(brokerHeaders)
      .send({ outcome: 'APPROVED', creditMemo: 'ok' });
    expect(res.status).toBe(403);
  });

  test('logs AI override when aiOverrideReason provided', async () => {
    const decidedLoan = { ...mockLoan, creditDecision: 'APPROVED', status: 'APPROVED' };
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'IN_REVIEW' });
    m(prisma.loan.update).mockResolvedValue(decidedLoan);
    m(prisma.loanEvent.create).mockResolvedValue({});
    m(prisma.auditLog.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/underwriting/decision')
      .set(uwHeaders)
      .send({ outcome: 'APPROVED', creditMemo: 'Override reason test', aiOverrideReason: 'AI was too conservative' });

    expect(res.status).toBe(200);
    expect(m(prisma.auditLog.create)).toHaveBeenCalled();
  });
});

describe('GET /api/loans/:loanId/conditions', () => {
  test('returns conditions list', async () => {
    m(prisma.condition.findMany).mockResolvedValue([
      { id: 'cond-1', loanId: 'loan-1', type: 'CREDIT', description: 'Pay stubs needed', status: 'OPEN', creator: { firstName: 'Uma', lastName: 'UW' }, createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/loans/loan-1/conditions').set(uwHeaders);
    expect(res.status).toBe(200);
    expect(res.body.conditions).toHaveLength(1);
  });
});

describe('POST /api/loans/:loanId/conditions', () => {
  test('underwriter creates condition', async () => {
    m(prisma.condition.create).mockResolvedValue({
      id: 'cond-1', loanId: 'loan-1', type: 'CREDIT', description: 'Pay stubs', responsibleParty: 'BROKER', status: 'OPEN', createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/loans/loan-1/conditions')
      .set(uwHeaders)
      .send({ type: 'CREDIT', description: 'Pay stubs', responsibleParty: 'BROKER' });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('CREDIT');
  });

  test('returns 400 when fields missing', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/conditions')
      .set(uwHeaders)
      .send({ type: 'CREDIT' });
    expect(res.status).toBe(400);
  });

  test('broker gets 403', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/conditions')
      .set(brokerHeaders)
      .send({ type: 'CREDIT', description: 'test', responsibleParty: 'BROKER' });
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/loans/:loanId/conditions/:condId', () => {
  test('updates condition status', async () => {
    m(prisma.condition.update).mockResolvedValue({
      id: 'cond-1', loanId: 'loan-1', status: 'SATISFIED', satisfiedBy: 'uw-1', satisfiedAt: new Date(),
    });

    const res = await request(app)
      .put('/api/loans/loan-1/conditions/cond-1')
      .set(uwHeaders)
      .send({ status: 'SATISFIED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SATISFIED');
  });
});
