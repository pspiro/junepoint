jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, mockBroker, mockLoan, mockUnderwriter, m } from './helpers';

const brokerHeaders = authHeader('broker-1', 'BROKER');
const adminHeaders = authHeader('admin-1', 'ADMIN');
const uwHeaders = authHeader('uw-1', 'UNDERWRITER');

describe('GET /api/loans', () => {
  test('broker sees their loans', async () => {
    m(prisma.loan.findMany).mockResolvedValue([mockLoan]);
    m(prisma.loan.count).mockResolvedValue(1);

    const res = await request(app).get('/api/loans').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.loans).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/loans');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/loans', () => {
  test('broker creates loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null); // loan number uniqueness check
    m(prisma.loan.create).mockResolvedValue(mockLoan);
    m(prisma.loanEvent.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans')
      .set(brokerHeaders)
      .send({ program: 'BRIDGE', loanAmount: 500000 });

    expect(res.status).toBe(201);
    expect(res.body.loanNumber).toBe('CF-2025-00001');
  });

  test('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set(brokerHeaders)
      .send({ program: 'BRIDGE' });
    expect(res.status).toBe(400);
  });

  test('non-broker gets 403', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set(adminHeaders)
      .send({ program: 'BRIDGE', loanAmount: 500000 });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/loans/:loanId', () => {
  test('broker can get their own loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({
      ...mockLoan,
      broker: { id: 'broker-1', firstName: 'Bob', lastName: 'Broker', email: 'broker@test.com', phone: null },
      borrower: null,
      assignedUw: null,
      borrowerProfiles: [],
      conditions: [],
    });

    const res = await request(app).get('/api/loans/loan-1').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('loan-1');
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app).get('/api/loans/nonexistent').set(brokerHeaders);
    expect(res.status).toBe(404);
  });

  test('broker cannot access another broker\'s loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({
      ...mockLoan,
      brokerId: 'other-broker',
      broker: null,
      borrower: null,
      assignedUw: null,
      borrowerProfiles: [],
      conditions: [],
    });

    const res = await request(app).get('/api/loans/loan-1').set(brokerHeaders);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/loans/:loanId', () => {
  test('broker can edit their DRAFT loan', async () => {
    const updated = { ...mockLoan, propertyCity: 'Dallas' };
    m(prisma.loan.findUnique).mockResolvedValue(mockLoan);
    m(prisma.loan.update).mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/loans/loan-1')
      .set(brokerHeaders)
      .send({ propertyCity: 'Dallas' });

    expect(res.status).toBe(200);
    expect(res.body.propertyCity).toBe('Dallas');
  });

  test('broker cannot edit a non-DRAFT loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'SUBMITTED' });

    const res = await request(app)
      .put('/api/loans/loan-1')
      .set(brokerHeaders)
      .send({ propertyCity: 'Dallas' });

    expect(res.status).toBe(403);
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/loans/nonexistent')
      .set(brokerHeaders)
      .send({});
    expect(res.status).toBe(404);
  });
});

describe('POST /api/loans/:loanId/submit', () => {
  test('broker submits their DRAFT loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(mockLoan);
    m(prisma.loan.update).mockResolvedValue({ ...mockLoan, status: 'SUBMITTED' });
    m(prisma.loanEvent.create).mockResolvedValue({});
    m(prisma.aIAnalysis.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/submit')
      .set(brokerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SUBMITTED');
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app).post('/api/loans/nonexistent/submit').set(brokerHeaders);
    expect(res.status).toBe(404);
  });

  test('returns 403 for another broker\'s loan', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, brokerId: 'other-broker' });
    const res = await request(app).post('/api/loans/loan-1/submit').set(brokerHeaders);
    expect(res.status).toBe(403);
  });

  test('returns 400 when loan is not DRAFT', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'SUBMITTED' });
    const res = await request(app).post('/api/loans/loan-1/submit').set(brokerHeaders);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/loans/:loanId/events', () => {
  test('underwriter transitions SUBMITTED to IN_REVIEW', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'SUBMITTED' });
    m(prisma.loan.update).mockResolvedValue({ ...mockLoan, status: 'IN_REVIEW' });
    m(prisma.loanEvent.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/events')
      .set(uwHeaders)
      .send({ transition: 'IN_REVIEW' });

    expect(res.status).toBe(200);
  });

  test('returns 400 for invalid transition', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'DRAFT' });

    const res = await request(app)
      .post('/api/loans/loan-1/events')
      .set(uwHeaders)
      .send({ transition: 'CLOSED' });

    expect(res.status).toBe(400);
  });

  test('returns 403 when role not allowed for transition', async () => {
    m(prisma.loan.findUnique).mockResolvedValue({ ...mockLoan, status: 'SUBMITTED' });

    const res = await request(app)
      .post('/api/loans/loan-1/events')
      .set(brokerHeaders)
      .send({ transition: 'IN_REVIEW' });

    expect(res.status).toBe(403);
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/loans/nonexistent/events')
      .set(uwHeaders)
      .send({ transition: 'IN_REVIEW' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/loans/:loanId/assign', () => {
  test('admin assigns underwriter to loan', async () => {
    m(prisma.user.findFirst).mockResolvedValue(mockUnderwriter);
    m(prisma.loan.update).mockResolvedValue({ ...mockLoan, assignedUwId: 'uw-1', status: 'IN_REVIEW' });
    m(prisma.loanEvent.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/loans/loan-1/assign')
      .set(adminHeaders)
      .send({ underwriterId: 'uw-1' });

    expect(res.status).toBe(200);
  });

  test('returns 400 when underwriter not found', async () => {
    m(prisma.user.findFirst).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/loans/loan-1/assign')
      .set(adminHeaders)
      .send({ underwriterId: 'bad-id' });
    expect(res.status).toBe(400);
  });

  test('broker gets 403', async () => {
    const res = await request(app)
      .post('/api/loans/loan-1/assign')
      .set(brokerHeaders)
      .send({ underwriterId: 'uw-1' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/loans/:loanId/events', () => {
  test('returns audit trail', async () => {
    m(prisma.loanEvent.findMany).mockResolvedValue([
      { id: 'ev-1', loanId: 'loan-1', eventType: 'LOAN_CREATED', actor: { firstName: 'Bob', lastName: 'Broker', role: 'BROKER' }, createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/loans/loan-1/events').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
  });
});
