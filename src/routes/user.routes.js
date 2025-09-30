import express from 'express'
import passport from 'passport' 
import { generalValidation } from '~/validations/general.validation'
import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { userBadgeController } from '~/controllers/userBadge.controller'
import { categoryController } from '~/controllers/category.controller.js'
import { userService } from '~/services/user.service.js'
import { loginRateLimiter, registerRateLimiter, verifyOtpRateLimiter } from '~/middlewares/limiter.middleware'

const Router = express.Router()

Router.post('/forgot-password', verifyOtpRateLimiter, generalValidation.emailValidation, userController.sendOTP)
Router.post('/reset-password', userValidation.resetPassword, userController.resetPassword)
Router.post('/register', registerRateLimiter, userValidation.register, userController.register)
Router.post('/login', loginRateLimiter, userValidation.login, userController.login)
Router.post('/logout', verifyToken, userController.logout)
Router.post('/request-token', userValidation.requestToken, userController.requestToken)
Router.put('/change-password', verifyToken, userValidation.changePassword, userController.changePassword)
Router.put('/location', verifyToken, userValidation.updateUserLocation, userController.updateUserLocation)
Router.post('/send-otp', verifyOtpRateLimiter, userValidation.sendOTP, userController.sendOTP)
Router.post('/verify-otp', userValidation.verifyOTP, userController.verifyOTP)

Router.get('/profile', verifyToken, userController.getProfile)
// Router.post('/logout', userController.logout)

Router.get('/badges', verifyToken, userBadgeController.getBadges)
Router.get('/badges/history', verifyToken, userBadgeController.getPointHistory)

Router.get('/outstanding-bloggers', userController.getOutstandingBloggers)

Router.get('/categories', categoryController.getAllCategories)

// Route for Facebook login
Router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }))
Router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  userController.oAuthLoginCallback
)

// Route for Google login
Router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
Router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  userController.oAuthLoginCallback
)

export const userRoute = Router