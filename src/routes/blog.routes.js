import express from 'express'
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogPrivacy,
  updateBlogStatus,
  deleteBlog,
  updateBlog,
  likeBlog
} from '../controllers/blog.controller.js'
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js'
import { blogValidation } from '../validations/blog.validation.js'

const Router = express.Router()

Router.get('/', getAllBlogs)
Router.post('/', verifyToken, blogValidation.createBlog, createBlog)
Router.get('/:id', getBlogById)
Router.patch('/:id/privacy', verifyToken, blogValidation.updateBlogPrivacy, updateBlogPrivacy)
Router.patch('/:id/status', verifyToken, verifyAdmin, blogValidation.updateBlogStatus, updateBlogStatus)
Router.delete('/:id', verifyToken, deleteBlog)
Router.put('/:id', verifyToken, blogValidation.updateBlog, updateBlog)
Router.patch('/:id/like', verifyToken, likeBlog)

export const blogRoute = Router
