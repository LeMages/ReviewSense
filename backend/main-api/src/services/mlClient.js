const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestPrediction(text) {
  const response = await axios.post(`${ML_SERVICE_URL}/predict`, { text }, { timeout: 30000 });
  const data = response.data || {};
  return {
    sentiment: data.sentiment || null,
    confidence: typeof data.confidence === 'number' ? data.confidence : null
  };
}

async function callMLService(text) {
  try {
    return await requestPrediction(text);
  } catch (err) {
    console.warn('[mlClient] ML service call failed:', err.message, '- retrying in 2s');
    await sleep(RETRY_DELAY_MS);
    try {
      return await requestPrediction(text);
    } catch (retryErr) {
      console.warn('[mlClient] ML service retry failed:', retryErr.message);
      return { sentiment: null, confidence: null };
    }
  }
}

module.exports = { callMLService, ML_SERVICE_URL };
