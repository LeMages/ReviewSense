const { Review, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

function requireAuth(context) {
  if (!context || !context.user || !context.user.userId) {
    throw new Error('Authentication required');
  }
}

const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (!context || !context.user) return null;
      const u = await User.findByPk(context.user.userId);
      if (!u) return null;
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role
      };
    },

    reviewStats: async (_parent, _args, context) => {
      requireAuth(context);
      const rows = await Review.findAll({
        attributes: ['predictedSentiment', [fn('COUNT', col('id')), 'count']],
        group: ['predictedSentiment']
      });
      const stats = { positive: 0, negative: 0, neutral: 0, total: 0 };
      for (const r of rows) {
        const key = r.predictedSentiment;
        const count = parseInt(r.get('count'), 10) || 0;
        if (key && stats.hasOwnProperty(key)) stats[key] = count;
        stats.total += count;
      }
      return stats;
    },

    sentimentDistribution: async (_parent, { days = 30 }, context) => {
      requireAuth(context);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const rows = await Review.findAll({
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          'predictedSentiment',
          [fn('COUNT', col('id')), 'count']
        ],
        where: { createdAt: { [Op.gte]: since } },
        group: [fn('DATE', col('createdAt')), 'predictedSentiment'],
        order: [[fn('DATE', col('createdAt')), 'ASC']]
      });
      return rows.map((r) => ({
        date: String(r.get('date')),
        count: parseInt(r.get('count'), 10) || 0,
        sentiment: r.predictedSentiment || 'neutral'
      }));
    },

    recentReviews: async (_parent, { limit = 10 }, context) => {
      requireAuth(context);
      const lim = Math.min(limit, 100);
      const rows = await Review.findAll({
        limit: lim,
        order: [['createdAt', 'DESC']]
      });
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        text: r.text,
        predictedSentiment: r.predictedSentiment,
        confidence: r.confidence,
        language: r.language,
        createdAt: r.createdAt.toISOString()
      }));
    }
  }
};

module.exports = { resolvers };
