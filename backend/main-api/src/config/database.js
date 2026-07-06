const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('[db] DATABASE_URL not set, defaulting to local dev DB');
}

const sequelize = new Sequelize(
  databaseUrl || 'postgres://reviewsense:devpass@localhost:5432/reviewsense',
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[sql] ${msg}`) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };
