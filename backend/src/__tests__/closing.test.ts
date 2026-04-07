jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, mockLoan, m } from './helpers';

const titleHeaders = authHeader('title-1', 'TITLE');
const adminHeaders = authHeader('admin-1', 'ADMIN');
const brokerHeaders = authHeader('broker-1', 'BROKER');

const mockChecklist = {
  id: 'cl-1',
  loanId: 'loan-1',
  appraisalReceived: 'PENDING',
  titleCommitment: 'PENDING',
  insuranceBinder: 'PENDING',
  floodCert: 'PENDING',
  survey: 'PENDING',
  loanDocsSigned: 'PENDING',
  wireConfirmed: 'PENDING',
  recordingConfirmed: 'PENDING',
  customItems: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/loans/:loanId/closing', () => {
  test('returns closing checklist (creates if missing)', async () => {
    m(prisma.closingChecklist.findUnique).mockResolvedValue(null);
    m(prisma.closingChecklist.create).mockResolvedValue(mockChecklist);
    m(prisma.loan.findUnique).mockResolvedValue({ fundedAt: null, wireAmount: null, wireDate: null, wireReference: null });

    const res = await request(app).get('/api/loans/loan-1/closing').set(titleHeaders);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('appraisalReceived');
  });

  test('returns existing checklist', async () => {
    m(prisma.closingChecklist.findUnique).mockResolvedValue(mockChecklist);
    m(prisma.loan.findUnique).mockResolvedValue({ fundedAt: null, wireAmount: null, wireDate: null, wireReference: null });

    const res = await request(app).get('/api/loans/loan-1/closing').set(titleHeaders);
    expect(res.status).toBe(200);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/loans/loan-1/closing');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/loans/:loanId/closing/ctc', () => {
  test('title agent updates known checklist item', async () => {
    m(prisma.closingChecklist.upsert).mockResolvedValue({ ...mockChecklist, appraisalReceived: 'APPROVED' });

    const res = await request(app)
      .post('/api/loans/loan-1/closing/ctc')
      .set(titleHeaders)
      .send({ item: 'appraisal_received', status: 'APPROVED' });

    expect(res.status).toBe(200);
    expect(res.body.appraisalReceived).toBe('APPROVED');
  });

  test('adds custom item', async () => {
    m(prisma.closingChecklist.upsert).mockResolvedValue(mockChecklist);
    m(prisma.closingChecklist.update).mockResolvedValue({ ...mockChecklist, customItems: [{ id: '1', item: 'custom_task', status: 'PENDING' }] });

    const res = await request(app)
      .post('/api/loans/loan-1/closing/ctc')
      .set(titleHeaders)
      .send({ item: 'custom_task', status: 'PENDING' });

    expect(res.status).toBe(200);
  });

  test('broker gets 403', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/closing/ctc')
      .set(brokerHeaders)
      .send({ item: 'appraisal_received', status: 'APPROVED' });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/loans/:loanId/closing/fund', () => {
  test('title agent funds loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'IN_CLOSING' });
    m(prisma.loan.update).mockResolvedValue({ ...mockLoan, status: 'CLOSED', wireAmount: 500000 });
    m(prisma.loanEvent.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/closing/fund')
      .set(titleHeaders)
      .send({ wireAmount: 500000, wireDate: '2025-06-01', wireReference: 'WIRE-001' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CLOSED');
  });

  test('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/closing/fund')
      .set(titleHeaders)
      .send({ wireAmount: 500000 });
    expect(res.status).toBe(400);
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/loans/loan-1/closing/fund')
      .set(titleHeaders)
      .send({ wireAmount: 500000, wireDate: '2025-06-01', wireReference: 'WIRE-001' });
    expect(res.status).toBe(404);
  });

  test('returns 400 when loan not IN_CLOSING', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'APPROVED' });
    const res = await request(app)
      .post('/api/loans/loan-1/closing/fund')
      .set(titleHeaders)
      .send({ wireAmount: 500000, wireDate: '2025-06-01', wireReference: 'WIRE-001' });
    expect(res.status).toBe(400);
  });

  test('non-title gets 403', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/closing/fund')
      .set(adminHeaders)
      .send({ wireAmount: 500000, wireDate: '2025-06-01', wireReference: 'WIRE-001' });
    expect(res.status).toBe(403);
  });
});
