jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, mockLoan, m } from './helpers';

const brokerHeaders = authHeader('broker-1', 'BROKER');
const uwHeaders = authHeader('uw-1', 'UNDERWRITER');
const adminHeaders = authHeader('admin-1', 'ADMIN');

describe('POST /api/ai/chat', () => {
  test('returns mock reply without loanId', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(brokerHeaders)
      .send({ message: 'What is the status?' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reply');
    expect(typeof res.body.reply).toBe('string');
  });

  test('stores analysis when loanId provided', async () => {
    m(prisma.aIAnalysis.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/ai/chat')
      .set(brokerHeaders)
      .send({ message: 'What is the DSCR?', loanId: 'loan-1' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toContain('DSCR');
    expect(m(prisma.aIAnalysis.create)).toHaveBeenCalled();
  });

  test('returns 400 when message missing', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set(brokerHeaders)
      .send({});
    expect(res.status).toBe(400);
  });

  test('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Hello' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/ai/analyze/:loanId', () => {
  test('underwriter triggers analysis', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(mockLoan);
    m(prisma.aIAnalysis.create).mockResolvedValue({});
    m(prisma.loan.update).mockResolvedValue(mockLoan);

    const res = await request(app)
      .post('/api/ai/analyze/loan-1')
      .set(uwHeaders)
      .send({ analysisType: 'UNDERWRITING' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('jobId');
    expect(res.body.queued).toBe(true);
  });

  test('admin can trigger analysis', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(mockLoan);
    m(prisma.aIAnalysis.create).mockResolvedValue({});
    m(prisma.loan.update).mockResolvedValue(mockLoan);

    const res = await request(app)
      .post('/api/ai/analyze/loan-1')
      .set(adminHeaders)
      .send({ analysisType: 'UNDERWRITING' });

    expect(res.status).toBe(200);
  });

  test('returns 404 when loan not found', async () => {
    m(prisma.loan.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/ai/analyze/nonexistent')
      .set(uwHeaders)
      .send({});
    expect(res.status).toBe(404);
  });

  test('broker gets 403', async () => {
    const res = await request(app)
      .post('/api/ai/analyze/loan-1')
      .set(brokerHeaders)
      .send({});
    expect(res.status).toBe(403);
  });
});

describe('GET /api/ai/analyses/:loanId', () => {
  test('returns analyses for loan', async () => {
    m(prisma.aIAnalysis.findMany).mockResolvedValue([
      { id: 'analysis-1', loanId: 'loan-1', analysisType: 'UNDERWRITING', scores: { composite: 74 }, createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/ai/analyses/loan-1').set(uwHeaders);
    expect(res.status).toBe(200);
    expect(res.body.analyses).toHaveLength(1);
  });

  test('returns empty array when no analyses', async () => {
    m(prisma.aIAnalysis.findMany).mockResolvedValue([]);
    const res = await request(app).get('/api/ai/analyses/loan-1').set(uwHeaders);
    expect(res.status).toBe(200);
    expect(res.body.analyses).toHaveLength(0);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/ai/analyses/loan-1');
    expect(res.status).toBe(401);
  });
});
