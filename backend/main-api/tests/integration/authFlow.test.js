jest.mock('axios');
jest.mock('../../src/services/notifier', () => ({
  notifyPrediction: jest.fn().mockResolvedValue(true)
}));

const axios = require('axios');
const { notifyPrediction } = require('../../src/services/notifier');
const { signToken } = require('../../src/middleware/authJwt');

const { sequelize, User, Review } = require('../../src/models');
const express = require('express');
const request = require('supertest');

const TEST_USER_ID = '22222222-2222-2222-2222-222222222222';
const TEST_GOOGLE_ID = 'integration-test-google';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/auth', require('../../src/routes/auth'));
  app.use('/api/v1/reviews', require('../../src/routes/reviews'));
  app.use('/api/v1/external', require('../../src/routes/external'));
  return app;
}

describe('Auth flow (integration)', () => {
  let app;
  let token;
  let user;

  beforeAll(async () => {
    app = buildApp();
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
    } catch (err) {
      console.warn('[integration:auth] DB unavailable, tests will be skipped:', err.message);
    }
    try {
      user = await User.create({
        id: TEST_USER_ID,
        googleId: TEST_GOOGLE_ID,
        email: 'integration@test.io',
        name: 'Integration Tester'
      });
    } catch (err) {
      user = await User.findOne({ where: { googleId: TEST_GOOGLE_ID } });
    }
    token = signToken({ userId: user.id, email: user.email, name: user.name });
  });

  afterAll(async () => {
    try {
      await Review.destroy({ where: { userId: TEST_USER_ID } });
      await User.destroy({ where: { id: TEST_USER_ID } });
    } catch (err) {
      /* ignore */
    }
    try {
      await sequelize.close();
    } catch (err) {
      /* ignore */
    }
  });

  test('GET /auth/me without JWT returns 401', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  test('GET /auth/me with valid JWT returns 200 + user info', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('integration@test.io');
    expect(res.body.name).toBe('Integration Tester');
    expect(res.body.id).toBeDefined();
  });

  test('GET /auth/me with invalid JWT returns 401', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer not.a.real.jwt');
    expect(res.status).toBe(401);
  });

  test('POST /auth/logout returns 200', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(200);
  });
});
