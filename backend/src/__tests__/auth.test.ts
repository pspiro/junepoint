jest.mock('../lib/prisma');
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$2b$12$hashed'),
}));

import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import { prisma } from '../lib/prisma';
import { authHeader, makeToken, mockBroker, m } from './helpers';

describe('POST /api/auth/login', () => {
  test('returns tokens on valid credentials', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockBroker);
    m(bcrypt.compare).mockResolvedValue(true);
    m(prisma.user.update).mockResolvedValue(mockBroker);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'broker@test.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.role).toBe('BROKER');
  });

  test('returns 400 when fields missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  test('returns 401 when user not found', async () => {
    m(prisma.user.findUnique).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'pass' });
    expect(res.status).toBe(401);
  });

  test('returns 401 when password wrong', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockBroker);
    m(bcrypt.compare).mockResolvedValue(false);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'broker@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('returns 403 when account deactivated', async () => {
    m(prisma.user.findUnique).mockResolvedValue({ ...mockBroker, isActive: false });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'broker@test.com', password: 'Password123!' });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/auth/logout', () => {
  test('returns ok when authenticated', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set(authHeader('broker-1', 'BROKER'));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('returns 401 when no token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  test('returns new access token for valid refresh token', async () => {
    const refreshToken = makeToken('broker-1', 'BROKER');
    // Build a proper refresh token with type: 'refresh'
    const jwt = require('jsonwebtoken');
    const validRefresh = jwt.sign({ sub: 'broker-1', type: 'refresh' }, 'test-secret', { expiresIn: 2592000 });

    m(prisma.user.findUnique).mockResolvedValue(mockBroker);

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: validRefresh });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  test('returns 400 when refreshToken missing', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  test('returns 401 for invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });

  test('returns 401 when user inactive', async () => {
    const jwt = require('jsonwebtoken');
    const validRefresh = jwt.sign({ sub: 'broker-1', type: 'refresh' }, 'test-secret', { expiresIn: 2592000 });
    m(prisma.user.findUnique).mockResolvedValue({ ...mockBroker, isActive: false });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: validRefresh });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/magic-link', () => {
  test('returns tokens for valid magic link token', async () => {
    const jwt = require('jsonwebtoken');
    const magicToken = jwt.sign({ sub: 'borrower-1', type: 'magic' }, 'test-secret', { expiresIn: '7d' });
    const mockBorrower = { ...mockBroker, id: 'borrower-1', role: 'BORROWER' };

    m(prisma.user.findUnique).mockResolvedValue(mockBorrower);
    m(prisma.user.update).mockResolvedValue(mockBorrower);

    const res = await request(app)
      .post('/api/auth/magic-link')
      .send({ token: magicToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  test('returns 400 when token missing', async () => {
    const res = await request(app).post('/api/auth/magic-link').send({});
    expect(res.status).toBe(400);
  });

  test('returns 401 for wrong token type', async () => {
    const jwt = require('jsonwebtoken');
    const wrongToken = jwt.sign({ sub: 'broker-1', type: 'refresh' }, 'test-secret', { expiresIn: '7d' });
    const res = await request(app)
      .post('/api/auth/magic-link')
      .send({ token: wrongToken });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/register', () => {
  test('creates broker and returns tokens', async () => {
    m(prisma.user.findUnique).mockResolvedValue(null);
    m(prisma.user.create).mockResolvedValue({ ...mockBroker, id: 'new-broker' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'Password123!', firstName: 'New', lastName: 'Broker' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
  });

  test('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@test.com', password: 'Password123!' });
    expect(res.status).toBe(400);
  });

  test('returns 409 when email already registered', async () => {
    m(prisma.user.findUnique).mockResolvedValue(mockBroker);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'broker@test.com', password: 'pass', firstName: 'A', lastName: 'B' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/forgot-password', () => {
  test('returns ok (stub)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'x@x.com' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('POST /api/auth/reset-password', () => {
  test('returns ok (stub)', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token: 'tok', password: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
