import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'

import { categoryValidation } from '~/validations/category.validation.js'
import { categoryController } from '~/controllers/category.controller.js'

const Router = express.Router()

Router.post('/places', verifyToken, verifyAdmin, placeValidation.createNew, placeController.createNew)
Router.get('/places', verifyToken, verifyAdmin, placeController.getAllPlaces)
Router.patch('/places/:id', verifyToken, verifyAdmin, placeValidation.idValidate, placeController.updatePlace)
Router.delete('/places/:id', verifyToken, verifyAdmin, placeValidation.idValidate, placeController.destroyPlace)

Router.post('/categories', verifyToken, verifyAdmin, categoryValidation.createNew, categoryController.createNew)
Router.get('/categories', verifyToken, verifyAdmin, categoryController.getAllCategories)
Router.patch('/categories/:id', verifyToken, verifyAdmin, categoryValidation.idValidate, categoryController.updateCategory)
Router.delete('/categories/:id', verifyToken, verifyAdmin, categoryValidation.idValidate, categoryController.deleteCategory)

export const adminRoute = Router