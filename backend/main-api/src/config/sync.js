const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { sequelize } = require('../models');

(async () => {
  try {
    console.log('[sync] connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('[sync] connection OK, syncing models (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('[sync] ✅ tables created/updated');
    process.exit(0);
  } catch (err) {
    console.error('[sync] ❌ failed:', err.message);
    process.exit(1);
  }
})();
