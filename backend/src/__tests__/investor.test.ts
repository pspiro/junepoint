jest.mock('../lib/prisma');

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, m } from './helpers';

const investorHeaders = authHeader('investor-1', 'INVESTOR');
const adminHeaders = authHeader('admin-1', 'ADMIN');
const brokerHeaders = authHeader('broker-1', 'BROKER');

const mockListing = {
  id: 'listing-1',
  loanId: 'loan-1',
  askingPrice: 490000,
  yield: 0.085,
  aiSummary: 'Solid bridge loan.',
  soldAt: null,
  listedAt: new Date('2025-01-01'),
  loan: {
    program: 'BRIDGE',
    loanAmount: 500000,
    ltv: 0.8,
    dscr: 1.2,
    propertyState: 'TX',
    status: 'ON_MARKET',
  },
};

const mockBid = {
  id: 'bid-1',
  listingId: 'listing-1',
  investorId: 'investor-1',
  bidAmount: 490000,
  terms: 'Standard terms',
  status: 'PENDING',
  createdAt: new Date(),
};

describe('GET /api/marketplace', () => {
  test('investor can list marketplace', async () => {
    m(prisma.investorListing.findMany).mockResolvedValue([mockListing]);
    m(prisma.investorListing.count).mockResolvedValue(1);

    const res = await request(app).get('/api/marketplace').set(investorHeaders);
    expect(res.status).toBe(200);
    expect(res.body.listings).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  test('admin can list marketplace', async () => {
    m(prisma.investorListing.findMany).mockResolvedValue([]);
    m(prisma.investorListing.count).mockResolvedValue(0);

    const res = await request(app).get('/api/marketplace').set(adminHeaders);
    expect(res.status).toBe(200);
  });

  test('broker gets 403', async () => {
    const res = await request(app).get('/api/marketplace').set(brokerHeaders);
    expect(res.status).toBe(403);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/marketplace');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/marketplace/:loanId', () => {
  test('returns listing with bids', async () => {
    m(prisma.investorListing.findUnique).mockResolvedValue({
      ...mockListing,
      loan: {
        ...mockListing.loan,
        loanAmount: 500000,
        brokerId: 'broker-1',
        id: 'loan-1',
      },
      bids: [mockBid],
    });

    const res = await request(app).get('/api/marketplace/loan-1').set(investorHeaders);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('askingPrice');
  });

  test('returns 404 when not found', async () => {
    m(prisma.investorListing.findUnique).mockResolvedValue(null);
    const res = await request(app).get('/api/marketplace/nonexistent').set(investorHeaders);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/marketplace/:loanId/bid', () => {
  test('investor places bid', async () => {
    m(prisma.investorListing.findUnique).mockResolvedValue(mockListing);
    m(prisma.investorBid.create).mockResolvedValue(mockBid);

    const res = await request(app)
      .post('/api/marketplace/loan-1/bid')
      .set(investorHeaders)
      .send({ bidAmount: 490000, terms: 'Standard terms' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('bidAmount');
  });

  test('returns 400 when bidAmount missing', async () => {
    const res = await request(app)
      .post('/api/marketplace/loan-1/bid')
      .set(investorHeaders)
      .send({});
    expect(res.status).toBe(400);
  });

  test('returns 404 when listing not found', async () => {
    m(prisma.investorListing.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/marketplace/loan-1/bid')
      .set(investorHeaders)
      .send({ bidAmount: 490000 });
    expect(res.status).toBe(404);
  });

  test('non-investor gets 403', async () => {
    const res = await request(app)
      .post('/api/marketplace/loan-1/bid')
      .set(brokerHeaders)
      .send({ bidAmount: 490000 });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/portfolio', () => {
  test('returns investor portfolio', async () => {
    m(prisma.investorBid.findMany).mockResolvedValue([
      {
        ...mockBid,
        status: 'ACCEPTED',
        bidAmount: 490000,
        listing: {
          loan: { id: 'loan-1', program: 'BRIDGE', loanAmount: 500000, status: 'SOLD' },
        },
      },
    ]);

    const res = await request(app).get('/api/portfolio').set(investorHeaders);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('loans');
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('totalDeployed');
  });

  test('non-investor gets 403', async () => {
    const res = await request(app).get('/api/portfolio').set(brokerHeaders);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/criteria', () => {
  test('returns investor criteria', async () => {
    m(prisma.investorCriteria.findUnique).mockResolvedValue({
      investorId: 'investor-1', programs: ['BRIDGE'], minAmount: 100000, maxAmount: 2000000,
    });

    const res = await request(app).get('/api/criteria').set(investorHeaders);
    expect(res.status).toBe(200);
    expect(res.body.investorId).toBe('investor-1');
  });

  test('returns default object when no criteria set', async () => {
    m(prisma.investorCriteria.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/api/criteria').set(investorHeaders);
    expect(res.status).toBe(200);
    expect(res.body.investorId).toBe('investor-1');
  });

  test('non-investor gets 403', async () => {
    const res = await request(app).get('/api/criteria').set(brokerHeaders);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/criteria', () => {
  test('investor updates criteria', async () => {
    m(prisma.investorCriteria.upsert).mockResolvedValue({
      investorId: 'investor-1', programs: ['BRIDGE', 'DSCR'], minAmount: 200000, maxAmount: 3000000, maxLtv: 0.75, minYield: 0.08, states: ['TX', 'FL'],
    });

    const res = await request(app)
      .put('/api/criteria')
      .set(investorHeaders)
      .send({ programs: ['BRIDGE', 'DSCR'], minAmount: 200000, maxAmount: 3000000, maxLtv: 0.75, minYield: 0.08, states: ['TX', 'FL'] });

    expect(res.status).toBe(200);
    expect(res.body.programs).toContain('DSCR');
  });

  test('non-investor gets 403', async () => {
    const res = await request(app)
      .put('/api/criteria')
      .set(adminHeaders)
      .send({ programs: ['BRIDGE'] });
    expect(res.status).toBe(403);
  });
});
