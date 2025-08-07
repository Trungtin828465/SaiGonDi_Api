import ReviewModel from '~/models/Review.model.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import PlaceModel from '~/models/Place.model.js'

/**
 * Tạo đánh giá mới cho địa điểm
 */
const createReview = async (placeId, reviewData, userId) => {
  const place = await PlaceModel.findById(placeId)
  if (!place) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
  }

  if (place.status !== 'approved') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Địa điểm chưa được duyệt.')
  }

  const existingReview = await ReviewModel.findOne({ placeId, userId })
  if (existingReview) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã đánh giá địa điểm này rồi.')
  }

  const newReview = await ReviewModel.create({
    ...reviewData,
    placeId,
    userId
  })

  return newReview
}

/**
 * Lấy danh sách đánh giá cho địa điểm (có phân trang)
 */
const getReviewsByPlace = async (placeId, queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1
  const limit = parseInt(queryParams.limit, 10) || 10
  const skip = (page - 1) * limit

  const filter = { placeId }

  const [reviews, total] = await Promise.all([
    ReviewModel.find(filter)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ReviewModel.countDocuments(filter)
  ])

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

/**
 * Xoá đánh giá (chỉ chủ sở hữu hoặc admin)
 */
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

/**
 * Like / Unlike đánh giá
 */
const likeReview = async (reviewId, userId) => {
  const review = await ReviewModel.findById(reviewId)
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá.')
  }

  const alreadyLiked = review.likeBy.includes(userId)

  if (alreadyLiked) {
    review.likeBy = review.likeBy.filter(id => id.toString() !== userId.toString())
  } else {
    review.likeBy.push(userId)
  }

  review.totalLikes = review.likeBy.length

  await review.save()
  return review
}

export const reviewService = {
  createReview,
  getReviewsByPlace,
  deleteReview,
  likeReview
}
