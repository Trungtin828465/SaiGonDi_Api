import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import User from '../models/User.model.js'

dotenv.config()

// === FACEBOOK STRATEGY ===
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK,
  profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id })
    if (!user) {
      user = new User({
        username: profile.displayName + '_fb',
        facebookId: profile.id,
        email: profile.emails?.[0]?.value,
        provider: 'facebook',
        displayName: profile.displayName
      })
      await user.save()
    }
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

// === GOOGLE STRATEGY ===
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id })
    if (!user) {
      user = new User({
        username: profile.displayName + '_gg',
        googleId: profile.id,
        email: profile.emails?.[0]?.value,
        provider: 'google',
        displayName: profile.displayName
      })
      await user.save()
    }
    return done(null, user)
  } catch (err) {
    return done(err, null)
  }
}))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

export default passport
