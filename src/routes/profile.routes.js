import express from 'express'
import { verifyToken } from '~/middlewares/auth.middleware.js'
import { profileController } from '~/controllers/profile.controller.js'
import { uploadFiles } from '../middlewares/multer.middleware.js'
import { uploadAvatar } from '~/middlewares/cloudinary.middleware.js'
const Router = express.Router()

Router.get('/', verifyToken, profileController.getProfile)
Router.get('/favorites', verifyToken, profileController.getFavoritePlaces)
Router.get('/checkins', verifyToken, profileController.getUserCheckins)
Router.put('/', verifyToken, uploadFiles.single('avatar'), uploadAvatar, profileController.updateProfile)
Router.get('/reviews', verifyToken, profileController.getUserReviews)
Router.get('/suggested-places', verifyToken, profileController.getSuggestedPlaces)
Router.get('/score', verifyToken, profileController.getScoreAndTitle)

export const profileRoute = Router