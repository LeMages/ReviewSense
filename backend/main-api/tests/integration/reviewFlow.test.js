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

const TEST_USER_ID = '33333333-3333-3333-3333-333333333333';
const TEST_GOOGLE_ID = 'reviewflow-test-google';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/reviews', require('../../src/routes/reviews'));
  app.use('/api/v1/external', require('../../src/routes/external'));
  return app;
}

describe('Review flow (integration)', () => {
  let app;
  let token;
  let user;
  let dbAvailable = false;

  beforeAll(async () => {
    app = buildApp();
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      dbAvailable = true;
    } catch (err) {
      console.warn('[integration:reviews] DB unavailable, will test what we can:', err.message);
    }

    if (dbAvailable) {
      try {
        user = await User.create({
          id: TEST_USER_ID,
          googleId: TEST_GOOGLE_ID,
          email: 'reviewflow@test.io',
          name: 'Review Flow'
        });
      } catch (err) {
        user = await User.findOne({ where: { googleId: TEST_GOOGLE_ID } });
      }
      token = signToken({ userId: user.id, email: user.email, name: user.name });
    }
  });

  beforeEach(() => {
    axios.post.mockReset();
    notifyPrediction.mockClear();
  });

  afterAll(async () => {
    if (dbAvailable) {
      try {
        await Review.destroy({ where: { userId: TEST_USER_ID } });
        await User.destroy({ where: { id: TEST_USER_ID } });
      } catch (err) {
        /* ignore */
      }
    }
    try {
      await sequelize.close();
    } catch (err) {
      /* ignore */
    }
  });

  test('full review submission flow: POST then GET', async () => {
    if (!dbAvailable) {
      console.warn('[skip] requires DB');
      return;
    }
    axios.post.mockResolvedValueOnce({
      data: { sentiment: 'positive', confidence: 0.91 }
    });

    const sample = 'This is a great product, totally recommended!';
    const post = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: sample });
    expect(post.status).toBe(201);
    expect(post.body.review.predictedSentiment).toBe('positive');
    expect(post.body.review.confidence).toBe(0.91);
    expect(post.body.review.text).toBe(sample);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(notifyPrediction).toHaveBeenCalledTimes(1);

    const list = await request(app)
      .get('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.reviews)).toBe(true);
    expect(list.body.reviews.length).toBeGreaterThanOrEqual(1);
    expect(list.body.reviews[0].text).toBe(sample);
  });

  test('POST review triggers ML service call and persists result', async () => {
    if (!dbAvailable) {
      console.warn('[skip] requires DB');
      return;
    }
    axios.post.mockResolvedValueOnce({
      data: { sentiment: 'negative', confidence: 0.85 }
    });

    const sample = 'This is a bad product, would not recommend.';
    const post = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: sample });
    expect(post.status).toBe(201);

    const persisted = await Review.findOne({
      where: { userId: TEST_USER_ID, text: sample }
    });
    expect(persisted).not.toBeNull();
    expect(persisted.predictedSentiment).toBe('negative');
    expect(persisted.confidence).toBeCloseTo(0.85);
  });

  test('POST /api/v1/reviews without JWT returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({ text: 'A perfectly fine review text' });
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/external/predict returns ML result with JWT', async () => {
    axios.post.mockResolvedValueOnce({
      data: { sentiment: 'neutral', confidence: 0.6 }
    });
    const res = await request(app)
      .post('/api/v1/external/predict')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'It is a regular product, nothing special' });
    expect(res.status).toBe(200);
    expect(res.body.sentiment).toBe('neutral');
    expect(res.body.confidence).toBe(0.6);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/predict$/),
      { text: 'It is a regular product, nothing special' },
      expect.any(Object)
    );
  });

  test('POST /api/v1/external/predict without JWT returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/external/predict')
      .send({ text: 'A perfectly fine text here' });
    expect(res.status).toBe(401);
  });

  test('POST review gracefully handles ML service down (201 with null sentiment)', async () => {
    if (!dbAvailable) {
      console.warn('[skip] requires DB');
      return;
    }
    axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'A review while ML service is offline' });
    expect(res.status).toBe(201);
    expect(res.body.review.predictedSentiment).toBeNull();
    expect(res.body.review.confidence).toBeNull();
  });
});
