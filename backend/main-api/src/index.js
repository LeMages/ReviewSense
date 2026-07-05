require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const { sequelize } = require('./models');
const { typeDefs } = require('./graphql/typeDefs');
const { resolvers } = require('./graphql/resolvers');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const externalRoutes = require('./routes/external');
const { authJwt, verifyToken, extractToken } = require('./middleware/authJwt');
const { configurePassport, passport: configuredPassport } = require('./config/passport');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

configurePassport();

async function start() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false
  }));

  app.use(configuredPassport.initialize());
  app.use(configuredPassport.session());

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'main-api' }));

  app.use('/auth', authRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/external', externalRoutes);

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: NODE_ENV !== 'production'
  });
  await apollo.start();

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => {
        const user = verifyToken(extractToken(req));
        return { user, req };
      }
    })
  );

  app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    res.status(err.status || 500).json({
      error: err.name || 'InternalServerError',
      message: err.message || 'Something went wrong'
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[main-api] listening on http://localhost:${PORT} (env=${NODE_ENV})`);
  });

  try {
    await sequelize.authenticate();
    console.log('[db] PostgreSQL connection OK');
  } catch (err) {
    console.warn('[db] PostgreSQL connection failed (server still running):', err.message);
  }
}

start().catch((err) => {
  console.error('[fatal] failed to start main-api:', err);
  process.exit(1);
});
