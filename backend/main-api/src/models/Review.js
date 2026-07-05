const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [10, 5000] }
  },
  predictedSentiment: {
    type: DataTypes.ENUM('positive', 'negative', 'neutral'),
    allowNull: true
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: { min: 0, max: 1 }
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'en',
    allowNull: false
  }
}, {
  tableName: 'reviews',
  timestamps: true
});

module.exports = Review;
