import express from 'express'
import { serviceController } from '~/controllers/service.controller.js'
const Router = express.Router()

Router.get('/', serviceController.getAllServices)
Router.post('/', serviceController.createNew)
Router.patch('/:id', serviceController.updateService)
Router.delete('/:id', serviceController.deleteService)

export const serviceRoute = Router
