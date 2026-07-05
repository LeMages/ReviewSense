const express = require('express');
const { authJwt } = require('../middleware/authJwt');
const { callMLService } = require('../services/mlClient');

const router = express.Router();

router.post('/predict', authJwt, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'ValidationError', message: 'text is required' });
    }
    if (text.length < 10) {
      return res.status(400).json({ error: 'ValidationError', message: 'text is too short' });
    }

    const prediction = await callMLService(text);
    return res.json(prediction);
  } catch (err) {
    console.error('[external:predict]', err);
    return res.status(500).json({ error: 'InternalServerError', message: err.message });
  }
});

module.exports = router;
