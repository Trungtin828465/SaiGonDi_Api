import express from 'express'
import { verifyToken, verifyAdmin } from '~/middlewares/auth.middleware.js'
import { placeValidation } from '~/validations/place.validation.js'
import { placeController } from '~/controllers/place.controller.js'

const Router = express.Router()

Router.post('/suggest', verifyToken, placeValidation.createNew, placeController.createNew)
Router.get('/', placeController.getApprovedPlaces)
Router.get('/:id', placeValidation.getPlaceDetails, placeController.getPlaceDetails)
Router.patch('/:id', verifyToken, placeValidation.likePlace, placeController.likePlace)

export const placeRoute = Router