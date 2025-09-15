import express from 'express'
import { blogCommentController } from '../controllers/blogComment.controller.js'
import { blogCommentValidation } from '../validations/blogComment.validation.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

import { commentRateLimiter } from '~/middlewares/limiter.middleware.js'
import { uploadFiles } from '../middlewares/multer.middleware.js'
import { uploadCommentImages } from '../middlewares/cloudinary.middleware.js'

const router = express.Router()

// Report comment
router.post(
  '/report/:id',
  verifyToken,
  blogCommentValidation.validateCommentId,
  blogCommentValidation.validateReport,
  blogCommentController.reportComment
)

// Tạo comment mới cho 1 blog
router.post(
  '/:blogId',
  commentRateLimiter,
  verifyToken,
  uploadFiles.array('images', 1),
  uploadCommentImages,
  blogCommentValidation.validateBlogId,
  blogCommentController.createComment
)

// Lấy tất cả comment theo blogId
router.get(
  '/:blogId',
  blogCommentValidation.validateBlogId,
  blogCommentController.getCommentsByBlog
)

// Cập nhật 1 comment
router.patch(
  '/:id',
  verifyToken,
  uploadFiles.array('images', 1),
  uploadCommentImages,
  blogCommentValidation.validateCommentId,
  blogCommentController.updateComment
)

// Xóa comment
router.delete(
  '/:id',
  verifyToken,
  blogCommentValidation.validateCommentId,
  blogCommentController.deleteComment
)

// Like / Unlike comment
router.patch(
  '/like/:id',
  verifyToken,
  blogCommentValidation.validateCommentId,
  blogCommentController.likeComment
)

export const blogCommentRoute = router