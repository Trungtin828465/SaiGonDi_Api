import ReviewModel from '~/models/Review.model.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import PlaceModel from '~/models/Place.model.js'
import { badgeActionService } from './badgeAction.service.js'

const createReview = async (placeId, reviewData, userId) => {
  try {
    const place = await PlaceModel.findById(placeId)
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
    }
    if (place.status !== 'approved') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'không có địa điểm này!')
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
    await newReview.updatePlaceAvgRating()
    // Trigger badge action
    badgeActionService.handleUserAction(userId, 'create_review', { reviewId: newReview._id, placeId })
    return newReview
  } catch (error) {
    throw error
  }
}

const getReviewsByPlaceId = async (queryParams) => {
  try {
    const place = await PlaceModel.findById(queryParams.placeId)
    if (!place || place.status !== 'approved') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
    }
    const page = parseInt(queryParams.page, 10) || 1
    const limit = parseInt(queryParams.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const query = { placeId: queryParams.placeId }

    const reviews = await ReviewModel.find({ ...query, _hidden: false })
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
  } catch (error) {
    throw error
  }
}

const deleteReview = async (reviewId, user) => {
  try {
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
    await review.updatePlaceAvgRating()
    return { success: true, message: 'Đánh giá đã được xoá thành công.' }
  } catch (error) {
    throw error
  }
}

const updateReview = async (reviewId, reviewData, userId) => {
  try {
    const review = await ReviewModel.findById(reviewId)
    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đánh giá.')
    }
    if (review.userId.toString() !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền cập nhật đánh giá này.')
    }
    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      { ...reviewData, updatedAt: new Date() },
      { new: true }
    )
    await updatedReview.updatePlaceAvgRating()
    return updatedReview
  } catch (error) {
    throw error
  }
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
    // Trigger badge action
    badgeActionService.handleUserAction(userId, 'like_review', { reviewId })
  }

  review.totalLikes = review.likeBy.length

  await review.save()
  return review
}

export const reviewService = {
  createReview,
  getReviewsByPlaceId,
  deleteReview,
  updateReview,
  likeReview
}
