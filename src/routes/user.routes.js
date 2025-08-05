import express from 'express'
import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'

const Router = express.Router()

Router.post('/register', userValidation.register, userController.register)
Router.post('/login', userValidation.login, userController.login)
// Router.post('/logout', userController.logout)

Router.get('/', verifyToken, verifyAdmin, userController.getAllUsers)

export const userRoute = Router