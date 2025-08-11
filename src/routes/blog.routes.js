import express from 'express'
import {blogController} from '../controllers/blog.controller.js'
import { blogRateLimiter } from '~/middlewares/limiter.middleware.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'
import { blogValidation } from '../validations/blog.validation.js'

const Router = express.Router()

Router.get('/', verifyToken, blogController.getBlogs)
Router.post('/', blogRateLimiter, verifyToken, blogValidation.createBlog, blogController.createBlog)
Router.get('/:id', blogController.getBlogById)
Router.patch('/:id/privacy', verifyToken, blogValidation.updateBlogPrivacy, blogController.updateBlogPrivacy)
Router.patch('/:id/status', verifyToken, verifyAdmin, blogValidation.updateBlogStatus, blogController.updateBlogStatus)
Router.delete('/:id', verifyToken, blogController.deleteBlog)
Router.put('/:id', verifyToken, blogValidation.updateBlog, blogController.updateBlog)
Router.patch('/:id/like', verifyToken, blogController.likeBlog)
Router.post('/:id/share', verifyToken, blogController.shareBlog)

export const blogRoute = Router