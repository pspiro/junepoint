jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, mockDocument, m } from './helpers';

const brokerHeaders = authHeader('broker-1', 'BROKER');
const adminHeaders = authHeader('admin-1', 'ADMIN');
const uwHeaders = authHeader('uw-1', 'UNDERWRITER');

describe('POST /api/documents/presigned-url', () => {
  test('returns uploadUrl and documentId', async () => {
    m(prisma.document.create).mockResolvedValue(mockDocument);

    const res = await request(app)
      .post('/api/documents/presigned-url')
      .set(brokerHeaders)
      .send({ loanId: 'loan-1', fileName: 'bank_statement.pdf' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uploadUrl');
    expect(res.body).toHaveProperty('documentId');
  });

  test('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/documents/presigned-url')
      .set(brokerHeaders)
      .send({ loanId: 'loan-1' });
    expect(res.status).toBe(400);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).post('/api/documents/presigned-url').send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /api/loans/:loanId/documents', () => {
  test('confirms document upload', async () => {
    const pendingDoc = { ...mockDocument, status: 'PENDING', fileName: 'bank_statement.pdf' };
    const acceptedDoc = { ...mockDocument, status: 'ACCEPTED' };
    m(prisma.document.findFirst).mockResolvedValue(pendingDoc);
    m(prisma.document.update).mockResolvedValue(acceptedDoc);
    m(prisma.loanEvent.create).mockResolvedValue({});

    const res = await request(app)
      .post('/api/documents/loan-1/documents')
      .set(brokerHeaders)
      .send({ documentId: 'doc-1' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACCEPTED');
  });

  test('returns 404 when document not found', async () => {
    m(prisma.document.findFirst).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/documents/loan-1/documents')
      .set(brokerHeaders)
      .send({ documentId: 'missing' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/loans/:loanId/documents', () => {
  test('returns loan documents', async () => {
    m(prisma.document.findMany).mockResolvedValue([mockDocument]);
    const res = await request(app).get('/api/documents/loan-1/documents').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.documents).toHaveLength(1);
  });
});

describe('GET /api/loans/:loanId/documents/:docId', () => {
  test('returns document with downloadUrl', async () => {
    m(prisma.document.findFirst).mockResolvedValue(mockDocument);
    const res = await request(app).get('/api/documents/loan-1/documents/doc-1').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('downloadUrl');
  });

  test('returns 404 when not found', async () => {
    m(prisma.document.findFirst).mockResolvedValue(null);
    const res = await request(app).get('/api/documents/loan-1/documents/missing').set(brokerHeaders);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/loans/:loanId/documents/:docId', () => {
  test('underwriter can classify document', async () => {
    const updated = { ...mockDocument, docType: 'W-2', status: 'ACCEPTED' };
    m(prisma.document.update).mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/documents/loan-1/documents/doc-1')
      .set(uwHeaders)
      .send({ docType: 'W-2', status: 'ACCEPTED' });

    expect(res.status).toBe(200);
    expect(res.body.docType).toBe('W-2');
  });

  test('broker gets 403', async () => {
    const res = await request(app)
      .put('/api/documents/loan-1/documents/doc-1')
      .set(brokerHeaders)
      .send({ status: 'ACCEPTED' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/documents', () => {
  test('broker sees their documents', async () => {
    m(prisma.loan.findMany).mockResolvedValue([{ id: 'loan-1' }]);
    m(prisma.document.findMany).mockResolvedValue([mockDocument]);
    m(prisma.document.count).mockResolvedValue(1);

    const res = await request(app).get('/api/documents').set(brokerHeaders);
    expect(res.status).toBe(200);
    expect(res.body.documents).toHaveLength(1);
  });

  test('underwriter gets 403', async () => {
    const res = await request(app).get('/api/documents').set(uwHeaders);
    expect(res.status).toBe(403);
  });
});
