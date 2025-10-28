const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
},
async function verify(accessToken, refreshToken, profile, done) {
  // We'll handle Google authentication in the controller instead
  done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  // We'll handle user deserialization in the controller instead
  done(null, { id });
});

module.exports = passport;