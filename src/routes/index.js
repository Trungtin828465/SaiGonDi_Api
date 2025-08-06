import express from 'express'
import { userRoute } from './user.routes.js'
import { placeRoute } from './place.routes.js'
import { adminRoute } from './admin.routes.js'
const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'API is running' })
})

Router.use('/users', userRoute)
Router.use('/places', placeRoute)
Router.use('/admin', adminRoute)

export const APIs = Router