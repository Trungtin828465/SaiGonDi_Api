import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'

const Router = express.Router()

Router.post('/suggest', verifyToken, placeValidation.createNew, placeController.createNew)
Router.get('/', placeValidation.getApprovedPlaces, placeController.getApprovedPlaces)
Router.get('/favorites', verifyToken, placeController.getFavoritePlaces)
Router.get('/:id', placeValidation.getPlaceDetails, placeController.getPlaceDetails)
Router.patch('/:id', verifyToken, placeValidation.likePlace, placeController.likePlace)

Router.post('/:id/favorite', verifyToken, placeValidation.idValidate, placeController.addToFavorites)
Router.delete('/:id/favorite', verifyToken, placeValidation.idValidate, placeController.removeFromFavorites)
Router.post('/:id/checkin', verifyToken, placeValidation.idValidate, placeController.checkinPlace)

export const placeRoute = Router