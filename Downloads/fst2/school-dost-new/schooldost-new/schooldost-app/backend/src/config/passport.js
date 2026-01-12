// Passport Configuration for Google OAuth
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./database');
const { generateToken } = require('../middleware/auth.middleware');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await prisma.user.findFirst({
        where: { googleId: profile.id }
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails[0].value }
        });

        if (existingUser) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: profile.id,
              avatarUrl: existingUser.avatarUrl || profile.photos[0]?.value,
              emailVerified: true
            }
          });
        } else {
          // Create new user
          const username = `${profile.name.givenName.toLowerCase()}${Date.now().toString().slice(-4)}`;
          
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              fullName: profile.displayName,
              username,
              googleId: profile.id,
              avatarUrl: profile.photos[0]?.value,
              emailVerified: true,
              password: '' // No password for OAuth users
            }
          });
        }
      }

      // Generate JWT token
      const token = generateToken(user);

      return done(null, { user, token });
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
