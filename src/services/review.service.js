import ReviewModel from '~/models/Review.model.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import PlaceModel from '~/models/Place.model.js'

const createReview = async (placeId, reviewData, userId) => {
  const place = await PlaceModel.findById(placeId)

  if (!place) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
  }

  if (place.status !== 'approved') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không thể đánh giá một địa điểm chưa được duyệt.')
  }

  const existingReview = await ReviewModel.findOne({
    placeId,
    userId
  })

  if (existingReview) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã đánh giá địa điểm này rồi.')
  }

  const newReview = await ReviewModel.create({
    ...reviewData,
    placeId,
    userId: userId
  })

  return newReview
}

const getReviewsByPlace = async (placeId, queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1
  const limit = parseInt(queryParams.limit, 10) || 10
  const startIndex = (page - 1) * limit

  const query = { placeId }

  const reviews = await ReviewModel.find(query)
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)

  const total = await ReviewModel.countDocuments(query)

  return {
    reviews,
    pagination: {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  }
}

const deleteReview = async (reviewId, user) => {
  const review = await ReviewModel.findById(reviewId)

  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá.')
  }

  const isAuthor = review.userId.toString() === user.id.toString()
  const isAdmin = user.role === 'admin'

  if (!isAuthor && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xoá đánh giá này.')
  }


  await review.deleteOne()
}

export const reviewService = {
  createReview,
  getReviewsByPlace,
  deleteReview
}