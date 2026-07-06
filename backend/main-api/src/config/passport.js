const passport = require('passport');
const { User } = require('../models');

function configurePassport() {
  try {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      passport.use(
        new GoogleStrategy(
          {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const email =
                profile.emails && profile.emails[0] ? profile.emails[0].value : null;

              const [user] = await User.findOrCreate({
                where: { googleId: profile.id },
                defaults: {
                  googleId: profile.id,
                  email: email || `${profile.id}@unknown.local`,
                  name: profile.displayName || 'Unknown'
                }
              });
              return done(null, user);
            } catch (err) {
              return done(err, null);
            }
          }
        )
      );
      console.log('[auth] Google OAuth strategy loaded');
    } else {
      console.warn(
        '[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login disabled'
      );
    }
  } catch (err) {
    console.warn('[auth] passport-google-oauth20 not available:', err.message);
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return passport;
}

module.exports = { configurePassport, passport };
