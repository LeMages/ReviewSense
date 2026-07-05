const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });
const { sequelize, User, Review } = require('../models');

(async () => {
  try {
    console.log('[seed] connecting...');
    await sequelize.authenticate();

    const usersData = [
      { googleId: 'seed-google-1', email: 'alice@example.com', name: 'Alice Dupont', role: 'user' },
      { googleId: 'seed-google-2', email: 'bob@example.com', name: 'Bob Martin', role: 'admin' }
    ];

    const users = [];
    for (const u of usersData) {
      const [user] = await User.findOrCreate({ where: { googleId: u.googleId }, defaults: u });
      users.push(user);
    }
    console.log(`[seed] ${users.length} users ready`);

    const reviewsData = [
      { user: users[0], text: 'This product is absolutely amazing, I love it!', predictedSentiment: 'positive', confidence: 0.95, language: 'en' },
      { user: users[0], text: 'The quality is outstanding, would buy again.', predictedSentiment: 'positive', confidence: 0.91, language: 'en' },
      { user: users[0], text: 'It broke after one day. Total waste of money.', predictedSentiment: 'negative', confidence: 0.88, language: 'en' },
      { user: users[1], text: 'Shipping was okay, product is fine, nothing special.', predictedSentiment: 'neutral', confidence: 0.67, language: 'en' },
      { user: users[1], text: 'Decent value for the price, but could be better.', predictedSentiment: 'neutral', confidence: 0.72, language: 'en' }
    ];

    const existing = await Review.count();
    if (existing > 0) {
      console.log(`[seed] ${existing} reviews already present, skipping insert`);
    } else {
      for (const r of reviewsData) {
        await Review.create({
          userId: r.user.id,
          text: r.text,
          predictedSentiment: r.predictedSentiment,
          confidence: r.confidence,
          language: r.language
        });
      }
      console.log(`[seed] ${reviewsData.length} reviews inserted`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[seed] ❌ failed:', err.message);
    process.exit(1);
  }
})();
