import express from 'express'
import { userRoute } from './user.routes.js'
const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'API is running' })
})

Router.use('/users', userRoute)

export const APIs = Router