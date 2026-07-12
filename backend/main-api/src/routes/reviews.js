const express = require('express');
const { Op } = require('sequelize');
const { authJwt } = require('../middleware/authJwt');
const { Review } = require('../models');
const { callMLService } = require('../services/mlClient');
const { notifyPrediction } = require('../services/notifier');

const router = express.Router();

function dateRangeFor({ date, month, year }) {
  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
  }
  if (month) {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    return { start, end: new Date(Date.UTC(y, m, 1)) };
  }
  if (year) {
    const y = Number(year);
    const start = new Date(Date.UTC(y, 0, 1));
    return { start, end: new Date(Date.UTC(y + 1, 0, 1)) };
  }
  return null;
}

router.post('/', authJwt, async (req, res) => {
  try {
    const { text, language } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'ValidationError', message: 'text is required' });
    }
    if (text.length < 10 || text.length > 5000) {
      return res.status(400).json({ error: 'ValidationError', message: 'text length must be between 10 and 5000' });
    }

    const prediction = await callMLService(text);

    const review = await Review.create({
      userId: req.user.userId,
      text,
      predictedSentiment: prediction.sentiment,
      confidence: prediction.confidence,
      language: language || 'en'
    });

    notifyPrediction({
      id: review.id,
      text: review.text,
      predictedSentiment: review.predictedSentiment,
      confidence: review.confidence,
      createdAt: review.createdAt
    }).catch(() => {});

    return res.status(201).json({ review });
  } catch (err) {
    console.error('[reviews:create]', err);
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

router.get('/', authJwt, async (req, res) => {
  try {
    const { sentiment, limit, offset, date, month, year } = req.query;

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'ValidationError', message: 'date must be in YYYY-MM-DD format' });
    }
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'ValidationError', message: 'month must be in YYYY-MM format' });
    }
    if (year && !/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: 'ValidationError', message: 'year must be in YYYY format' });
    }

    const where = { userId: req.user.userId };
    if (sentiment) where.predictedSentiment = sentiment;

    const range = dateRangeFor({ date, month, year });
    if (range) where.createdAt = { [Op.gte]: range.start, [Op.lt]: range.end };

    const lim = Math.min(parseInt(limit, 10) || 20, 100);
    const off = parseInt(offset, 10) || 0;

    const { rows, count } = await Review.findAndCountAll({
      where,
      limit: lim,
      offset: off,
      order: [['createdAt', 'DESC']]
    });

    return res.json({ reviews: rows, total: count });
  } catch (err) {
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

router.get('/:id', authJwt, async (req, res) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id } });
    if (!review) {
      return res.status(404).json({ error: 'NotFound', message: 'Review not found' });
    }
    if (review.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not own this review' });
    }
    return res.json({ review });
  } catch (err) {
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

module.exports = router;
