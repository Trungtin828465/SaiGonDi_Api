import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'

import { categoryValidation } from '~/validations/category.validation.js'
import { categoryController } from '~/controllers/category.controller.js'

import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'

import { generalValidation } from '~/validations/general.validation.js'

const Router = express.Router()
Router.post('/login', userValidation.login, userController.login)
Router.post('/places', verifyToken, verifyAdmin, placeValidation.createNew, placeController.createNew)
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
export const adminRoute = Router