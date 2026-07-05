require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const { sequelize } = require('./models');
const { typeDefs } = require('./graphql/typeDefs');
const { resolvers } = require('./graphql/resolvers');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const externalRoutes = require('./routes/external');
const { authJwt, verifyToken, extractToken } = require('./middleware/authJwt');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let googleStrategy = null;
try {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    googleStrategy = new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { User } = require('./models');
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const [user] = await User.findOrCreate({
            where: { googleId: profile.id },
            defaults: {
              googleId: profile.id,
              email: email || `${profile.id}@unknown.local`,
              name: profile.displayName || 'Unknown'
            }
          });
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    );
    passport.use(googleStrategy);
    console.log('[auth] Google OAuth strategy loaded');
  } else {
    console.warn('[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login disabled');
  }
} catch (err) {
  console.warn('[auth] passport-google-oauth20 not available:', err.message);
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { User } = require('./models');
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

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

  app.use(passport.initialize());
  app.use(passport.session());

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
