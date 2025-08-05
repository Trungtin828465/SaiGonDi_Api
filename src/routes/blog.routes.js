import express from 'express';
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogPrivacy,
  deleteBlog
} from '../controllers/blog.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'
import { blogValidation } from '../validations/blog.validation.js'

const Router = express.Router();

Router.get('/', getAllBlogs);
Router.post('/', verifyToken, blogValidation.createBlog, createBlog); 
Router.get('/:id', getBlogById);
Router.patch('/:id/privacy', verifyToken, blogValidation.updateBlogPrivacy, updateBlogPrivacy); 
Router.delete('/:id', verifyToken, deleteBlog);

export const blogRoute = Router
