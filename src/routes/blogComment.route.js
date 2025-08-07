import express from 'express'
import { blogCommentController } from '../controllers/blogComment.controller.js'
import { blogCommentValidation } from '../validations/blogComment.validation.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Tạo comment mới cho 1 blog
router.post(
  '/:blogId',
  verifyToken,
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
