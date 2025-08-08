import express from 'express'
import { reviewController } from '../controllers/review.controller.js'
import { reviewValidation } from '../validations/review.validation.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Lấy danh sách đánh giá cho một địa điểm
router.get('/', reviewValidation.getReviewsByPlaceId, reviewController.getReviewsByPlaceId)

// Viết đánh giá cho một địa điểm (yêu cầu đăng nhập)
router.post('/:placeId', verifyToken, reviewValidation.createReview, reviewController.createReview)

// Cập nhật đánh giá (yêu cầu đăng nhập)
router.patch('/:id', verifyToken, reviewValidation.updateReview, reviewController.updateReview)

// Xoá một đánh giá (yêu cầu đăng nhập)
router.delete('/:id', verifyToken, reviewValidation.deleteReview, reviewController.deleteReview)

export const reviewRouter = router