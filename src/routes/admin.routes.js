import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'

import { categoryValidation } from '~/validations/category.validation.js'
import { categoryController } from '~/controllers/category.controller.js'

import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'

import { blogController } from '~/controllers/blog.controller.js'

import { adminValidation } from '~/validations/admin.validation'
import { adminController } from '~/controllers/admin.controller.js'

import { badgeController } from '~/controllers/badge.controller.js'

import { generalValidation } from '~/validations/general.validation.js'
import { uploadFiles } from '~/middlewares/multer.middleware.js'
import { uploadPlaceImages } from '~/middlewares/cloudinary.middleware.js'



const Router = express.Router()

Router.get('/me', verifyToken, verifyAdmin, adminController.getMe);
Router.post('/login', userValidation.login, userController.login)
Router.post('/places', verifyToken, verifyAdmin, uploadFiles.array('images', 10), uploadPlaceImages, placeValidation.createNew, placeController.createNew)
Router.get('/places', verifyToken, verifyAdmin, placeValidation.pagingValidate, placeController.getAllPlaces)
Router.get('/places/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.getAdminPlaceDetails)
Router.patch('/places/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.updatePlace)
Router.put('/places/:id/approve', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.approvePlace)
Router.put('/places/:id/coordinates', verifyToken, verifyAdmin, placeValidation.updatePlaceCoordinates, placeController.updatePlaceCoordinates)
Router.delete('/places/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, placeController.destroyPlace)

Router.post('/categories', verifyToken, verifyAdmin, categoryValidation.createNew, categoryController.createNew)
Router.get('/categories', verifyToken, verifyAdmin, categoryController.getAllCategories)
Router.patch('/categories/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, categoryController.updateCategory)
Router.delete('/categories/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, categoryController.deleteCategory)

Router.get('/users', verifyToken, verifyAdmin, userController.getAllUsers)
Router.get('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.getUserDetails)
Router.put('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.banUser)
Router.delete('/users/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, userController.destroyUser)

Router.get('/posts', verifyToken, verifyAdmin, blogController.getBlogs)
Router.get('/posts/:id', verifyToken, verifyAdmin, blogController.getBlogById)
Router.put('/posts/:id/privacy', verifyToken, verifyAdmin, blogController.updateBlogPrivacy)
Router.put('/posts/:id/status', verifyToken, verifyAdmin, blogController.updateBlogStatus)
Router.delete('/posts/:id', verifyToken, verifyAdmin, blogController.deleteBlog)

Router.get('/stats/overview', verifyToken, verifyAdmin, adminController.getOverviewStats)
Router.get('/stats/daily', verifyToken, verifyAdmin, adminController.getDailyStats)
Router.get('/stats/popular', verifyToken, verifyAdmin, adminController.getPopularStats)

Router.get('/badges', verifyToken, verifyAdmin, badgeController.getAllBadges)
Router.post('/badges', verifyToken, verifyAdmin, badgeController.createBadge)
Router.patch('/badges/:id', verifyToken, verifyAdmin, badgeController.updateBadge)
Router.delete('/badges/:id', verifyToken, verifyAdmin, badgeController.deleteBadge)

Router.get('/reviews', verifyToken, verifyAdmin, adminValidation.getFilteredReviews, adminController.getFilteredReviews)
Router.delete('/reviews/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.deleteReview)
Router.put('/reviews/:id', verifyToken, verifyAdmin, generalValidation.paramIdValidate, adminController.hideReview)

export const adminRoute = Router
