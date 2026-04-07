jest.mock('../lib/prisma');
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashed'),
}));

import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, mockAdmin, mockBroker, mockUnderwriter, m } from './helpers';

describe('GET /api/users/me', () => {
  test('returns current user', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockBroker);
    const res = await request(app).get('/api/users/me').set(authHeader('broker-1', 'BROKER'));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('broker-1');
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('cognitoSub');
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  test('returns 404 when user not found', async () => {
    m(prisma.user.findUnique).mockResolvedValue(null);
    const res = await request(app).get('/api/users/me').set(authHeader('broker-1', 'BROKER'));
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/me', () => {
  test('updates and returns current user', async () => {
    const updated = { ...mockBroker, firstName: 'Updated' };
    m(prisma.user.update).mockResolvedValue(updated);
    const res = await request(app)
      .put('/api/users/me')
      .set(authHeader('broker-1', 'BROKER'))
      .send({ firstName: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body).not.toHaveProperty('passwordHash');
  });
});

describe('GET /api/users', () => {
  test('admin can list users', async () => {
    m(prisma.user.findMany).mockResolvedValue([mockBroker, mockAdmin]);
    m(prisma.user.count).mockResolvedValue(2);
    const res = await request(app).get('/api/users').set(authHeader('admin-1', 'ADMIN'));
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  test('non-admin gets 403', async () => {
    const res = await request(app).get('/api/users').set(authHeader('broker-1', 'BROKER'));
    expect(res.status).toBe(403);
  });
});

describe('POST /api/users', () => {
  test('admin creates user', async () => {
    m(prisma.user.findUnique).mockResolvedValue(null);
    m(prisma.user.create).mockResolvedValue(mockUnderwriter);
    const res = await request(app)
      .post('/api/users')
      .set(authHeader('admin-1', 'ADMIN'))
      .send({ email: 'uw@test.com', firstName: 'Uma', lastName: 'Underwriter', role: 'UNDERWRITER' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('tempPassword');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  test('returns 400 when fields missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set(authHeader('admin-1', 'ADMIN'))
      .send({ email: 'uw@test.com' });
    expect(res.status).toBe(400);
  });

  test('returns 409 when email exists', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockUnderwriter);
    const res = await request(app)
      .post('/api/users')
      .set(authHeader('admin-1', 'ADMIN'))
      .send({ email: 'uw@test.com', firstName: 'Uma', lastName: 'Underwriter', role: 'UNDERWRITER' });
    expect(res.status).toBe(409);
  });

  test('non-admin gets 403', async () => {
    const res = await request(app)
      .post('/api/users')
      .set(authHeader('broker-1', 'BROKER'))
      .send({ email: 'x@x.com', firstName: 'X', lastName: 'Y', role: 'BROKER' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/users/:userId', () => {
  test('admin can get any user', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockBroker);
    const res = await request(app)
      .get('/api/users/broker-1')
      .set(authHeader('admin-1', 'ADMIN'));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('broker-1');
  });

  test('user can get themselves', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockBroker);
    const res = await request(app)
      .get('/api/users/broker-1')
      .set(authHeader('broker-1', 'BROKER'));
    expect(res.status).toBe(200);
  });

  test('user cannot get another user', async () => {
    const res = await request(app)
      .get('/api/users/other-user')
      .set(authHeader('broker-1', 'BROKER'));
    expect(res.status).toBe(403);
  });

  test('returns 404 when user not found', async () => {
    m(prisma.user.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .get('/api/users/nobody')
      .set(authHeader('admin-1', 'ADMIN'));
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/:userId', () => {
  test('admin can update user', async () => {
    m(prisma.user.update).mockResolvedValue({ ...mockBroker, firstName: 'Renamed' });
    const res = await request(app)
      .put('/api/users/broker-1')
      .set(authHeader('admin-1', 'ADMIN'))
      .send({ firstName: 'Renamed' });
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Renamed');
  });

  test('non-admin gets 403', async () => {
    const res = await request(app)
      .put('/api/users/broker-1')
      .set(authHeader('broker-1', 'BROKER'))
      .send({ firstName: 'Hacked' });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/users/invite', () => {
  test('broker invites borrower', async () => {
    m(prisma.user.findUnique).mockResolvedValue(null);
    m(prisma.user.create).mockResolvedValue({ ...mockBroker, id: 'borrower-1', role: 'BORROWER' });
    m(prisma.borrowerProfile.upsert).mockResolvedValue({});
    m(prisma.loan.update).mockResolvedValue({});

    const res = await request(app)
      .post('/api/users/invite')
      .set(authHeader('broker-1', 'BROKER'))
      .send({ email: 'borrower@test.com', firstName: 'Bo', lastName: 'Rower', loanId: 'loan-1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('magicToken');
    expect(res.body.inviteSent).toBe(true);
  });

  test('returns 400 when fields missing', async () => {
    const res = await request(app)
      .post('/api/users/invite')
      .set(authHeader('broker-1', 'BROKER'))
      .send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  test('non-broker gets 403', async () => {
    const res = await request(app)
      .post('/api/users/invite')
      .set(authHeader('admin-1', 'ADMIN'))
      .send({ email: 'x@x.com', firstName: 'X', lastName: 'Y', loanId: 'loan-1' });
    expect(res.status).toBe(403);
  });
});
