const axios = require('axios');

const NOTIF_SERVICE_URL = process.env.NOTIF_SERVICE_URL || 'http://localhost:4000';
const NOTIF_TIMEOUT_MS = 2000;

async function notifyPrediction(prediction) {
  if (!prediction || !prediction.sentiment) return false;
  try {
    await axios.post(
      `${NOTIF_SERVICE_URL}/notify`,
      { type: 'new_prediction', data: prediction },
      { timeout: NOTIF_TIMEOUT_MS }
    );
    return true;
  } catch (err) {
    console.warn('[notifier] broadcast failed (non-fatal):', err.message);
    return false;
  }
}

module.exports = { notifyPrediction, NOTIF_SERVICE_URL };
