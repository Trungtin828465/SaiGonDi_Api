import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'
import { generalValidation } from '~/validations/general.validation'

const Router = express.Router()

Router.post('/suggest', verifyToken, placeValidation.createNew, placeController.createNew)
Router.get('/', placeValidation.pagingValidate, placeController.getApprovedPlaces)
Router.get('/favorites', verifyToken, placeController.getFavoritePlaces)
Router.get('/:id', generalValidation.paramIdValidate, placeController.getPlaceDetails)
Router.patch('/:id', verifyToken, generalValidation.paramIdValidate, placeController.likePlace)

Router.post('/:id/favorite', verifyToken, generalValidation.paramIdValidate, placeController.addToFavorites)
Router.delete('/:id/favorite', verifyToken, generalValidation.paramIdValidate, placeController.removeFromFavorites)
Router.post('/:id/checkin', verifyToken, generalValidation.paramIdValidate, placeController.checkinPlace)

export const placeRoute = Router