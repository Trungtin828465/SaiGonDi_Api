import express from 'express'
import { userRoute } from './user.routes.js'
import { placeRoute } from './place.routes.js'
import { adminRoute } from './admin.routes.js'
import { blogRoute } from './blog.routes.js'
import { reviewRouter } from './review.route.js'
import { blogCommentRoute } from './blogComment.route.js'
import { profileRoute } from './profile.routes.js'
import { wardRoute } from './ward.routes.js'
import { questionRoute } from './question.routes.js'
import { hotRoute } from './hot.routes.js'

import { placeRateLimiter } from '../middlewares/limiter.middleware.js'
import { serviceRoute } from './service.routes.js'


const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'API is running' })
})


Router.use('/blogs', blogRoute)
Router.use('/comments', blogCommentRoute)
Router.use('/wards', wardRoute)
Router.use('/services', serviceRoute)
Router.use('/users', userRoute)

Router.use('/me', profileRoute)

Router.use('/places', placeRateLimiter)
Router.use('/places', placeRoute)

Router.use('/admin', adminRoute)
Router.use('/reviews', reviewRouter)
Router.use('/questions', questionRoute)
Router.use('/hot', hotRoute)


export const APIs = Router