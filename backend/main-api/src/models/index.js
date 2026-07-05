const { sequelize } = require('../config/database');
const User = require('./User');
const Review = require('./Review');

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { sequelize, User, Review };
