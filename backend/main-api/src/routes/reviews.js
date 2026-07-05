const express = require('express');
const { authJwt } = require('../middleware/authJwt');
const { Review } = require('../models');
const { callMLService } = require('../services/mlClient');

const router = express.Router();

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

    return res.status(201).json({ review });
  } catch (err) {
    console.error('[reviews:create]', err);
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

router.get('/', authJwt, async (req, res) => {
  try {
    const { sentiment, limit, offset } = req.query;
    const where = { userId: req.user.userId };
    if (sentiment) where.predictedSentiment = sentiment;

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
