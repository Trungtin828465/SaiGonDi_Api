import express from 'express'
import { reviewController } from '../controllers/review.controller.js'
import { reviewValidation } from '../validations/review.validation.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Lấy danh sách đánh giá cho một địa điểm
router.get('/place/:placeId', reviewController.getReviewsByPlace)

// Viết đánh giá cho một địa điểm (yêu cầu đăng nhập)
router.post(
  '/place/:placeId',
  verifyToken,
  reviewValidation.createReview,
  reviewController.createReview
)

// Xoá một đánh giá (yêu cầu đăng nhập)
router.delete('/:reviewId', verifyToken, reviewValidation.validateReviewId, reviewController.deleteReview)

export const reviewRouter = router