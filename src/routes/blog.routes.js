import express from 'express'
import {blogController} from '../controllers/blog.controller.js'
import { blogRateLimiter, shareRateLimiter } from '~/middlewares/limiter.middleware.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'
import { blogValidation } from '../validations/blog.validation.js'
import { uploadFiles } from '../middlewares/multer.middleware.js';
import { uploadBlogFiles } from '../middlewares/cloudinary.middleware.js';
//import /middlewares/cloudinary.middleware.js'

const Router = express.Router()

Router.get('/', verifyToken, blogController.getBlogs)
Router.post('/', blogRateLimiter, verifyToken, uploadFiles.array('files'), uploadBlogFiles, blogValidation.createBlog, blogController.createBlog)

Router.get('/slug/:slug', blogController.getBlogBySlug)
Router.get('/:id', blogController.getBlogById)
Router.patch('/:id/privacy', verifyToken, blogValidation.updateBlogPrivacy, blogController.updateBlogPrivacy)
Router.delete('/:id', verifyToken, blogController.deleteBlog)
Router.put('/:id', verifyToken,uploadFiles.array('files'), uploadBlogFiles, blogValidation.updateBlog, blogController.updateBlog)
Router.patch('/:id/like', verifyToken, blogController.likeBlog)
Router.post('/:id/share', shareRateLimiter, verifyToken, blogController.shareBlog)

export const blogRoute = Router