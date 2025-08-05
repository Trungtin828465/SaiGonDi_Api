import { StatusCodes } from 'http-status-codes'
import { reviewService } from '../services/review.service.js'

const createReview = async (req, res, next) => {
  try {
    const { placeId } = req.params
    const userId = req.user.id
    const newReview = await reviewService.createReview(placeId, req.body, userId)
    res.status(StatusCodes.CREATED).json({ success: true, data: newReview })
  } catch (error) {
    next(error)
  }
}

const getReviewsByPlace = async (req, res, next) => {
  try {
    const { placeId } = req.params
    const result = await reviewService.getReviewsByPlace(placeId, req.query)
    res.status(StatusCodes.OK).json({
      success: true,
      count: result.reviews.length,
      pagination: result.pagination,
      data: result.reviews
    })
  } catch (error) {
    next(error)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params
    const user = req.user

    await reviewService.deleteReview(reviewId, user)
    res.status(StatusCodes.OK).json({ success: true, message: 'Đánh giá đã được xoá thành công.' })
  } catch (error) {
    next(error)
  }
}

export const reviewController = {
  createReview,
  getReviewsByPlace,
  deleteReview
}