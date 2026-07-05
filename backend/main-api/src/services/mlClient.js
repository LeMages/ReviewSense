const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function callMLService(text) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, { text }, { timeout: 10000 });
    const data = response.data || {};
    return {
      sentiment: data.sentiment || null,
      confidence: typeof data.confidence === 'number' ? data.confidence : null
    };
  } catch (err) {
    console.warn('[mlClient] ML service call failed:', err.message);
    return { sentiment: null, confidence: null };
  }
}

module.exports = { callMLService, ML_SERVICE_URL };
