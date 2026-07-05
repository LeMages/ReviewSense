jest.mock('axios');
const axios = require('axios');
const { callMLService } = require('../../src/services/mlClient');
const { signToken } = require('../../src/middleware/authJwt');

jest.mock('../../src/models', () => {
  const actual = jest.requireActual('../../src/models');
  return actual;
});

jest.mock('../../src/services/notifier', () => ({
  notifyPrediction: jest.fn().mockResolvedValue(true)
}));

const { notifyPrediction } = require('../../src/services/notifier');
const express = require('express');
const request = require('supertest');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/reviews', require('../../src/routes/reviews'));
  app.use('/api/v1/external', require('../../src/routes/external'));
  return app;
}

describe('review validation', () => {
  let app;
  let token;

  beforeAll(() => {
    app = buildTestApp();
    token = signToken({ userId: '11111111-1111-1111-1111-111111111111', email: 't@test.io', name: 'T' });
  });

  test('should reject POST /api/v1/reviews without auth (401)', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({ text: 'This is a long enough review' });
    expect(res.status).toBe(401);
  });

  test('should reject POST /api/v1/reviews with text shorter than 10 chars', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 10 and 5000|text is required/);
  });

  test('should reject POST /api/v1/reviews with text longer than 5000 chars', async () => {
    const longText = 'a'.repeat(5001);
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: longText });
    expect(res.status).toBe(400);
  });

  test('should reject POST /api/v1/reviews with missing text', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('should reject POST /api/v1/external/predict with text shorter than 10 chars', async () => {
    const res = await request(app)
      .post('/api/v1/external/predict')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'short' });
    expect(res.status).toBe(400);
  });
});
