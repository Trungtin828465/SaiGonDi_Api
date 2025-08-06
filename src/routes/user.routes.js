import express from 'express'
import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'

const Router = express.Router()

Router.post('/register', userValidation.register, userController.register)
Router.post('/login', userValidation.login, userController.login)
Router.put('/change-password', verifyToken, userValidation.changePassword, userController.changePassword)
Router.post('/phone-otp', userValidation.phoneOTP, userController.phoneOTP)
Router.post('/verify-phone-otp', userValidation.verifyOTP, userController.verifyOTP)
Router.post('/email-otp', userValidation.emailOTP, userController.emailOTP)
Router.post('/verify-email-otp', userValidation.verifyOTP, userController.verifyOTP)

Router.get('/profile', verifyToken, userController.getProfile)
// Router.post('/logout', userController.logout)

Router.get('/', verifyToken, verifyAdmin, userController.getAllUsers)

export const userRoute = Router