import express from 'express'
import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'

import { loginRateLimiter, registerRateLimiter, verifyOtpRateLimiter } from '~/middlewares/limiter.middleware'

const Router = express.Router()

Router.post('/register', registerRateLimiter, userValidation.register, userController.register)
Router.post('/login', loginRateLimiter, userValidation.login, userController.login)
Router.put('/change-password', verifyToken, userValidation.changePassword, userController.changePassword)
Router.post('/send-otp', verifyOtpRateLimiter, userValidation.emailOTP, userController.emailOTP)
Router.post('/verify-otp', userValidation.verifyOTP, userController.verifyOTP)

Router.get('/profile', verifyToken, userController.getProfile)
// Router.post('/logout', userController.logout)

Router.get('/', verifyToken, verifyAdmin, userController.getAllUsers)

export const userRoute = Router