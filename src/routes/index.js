import express from 'express'
import { userRoute } from './user.routes.js'
import { blogRoute } from './blog.routes.js'
import { reviewRouter } from './review.route.js'


const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'API is running' })
})

Router.use('/blogs', blogRoute)
Router.use('/users', userRoute)
Router.use('/reviews', reviewRouter)


export const APIs = Router