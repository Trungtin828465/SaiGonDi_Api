import { adminService } from '../services/admin.service.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import UserModel from '../models/User.model.js'

const getMe = async (req, res, next) => {
  try {
    const adminId = req.user?.id
    if (!adminId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc thiếu ID')
    }

    const admin = await adminService.getMe(adminId)

    if (!admin) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy user')
    }

    if (!admin.isAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền admin')
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        avatar: admin.avatar,
        role: admin.role
      }
    })
  } catch (error) {
    next(error)
  }
}

const getOverviewStats = async (req, res, next) => {
  try {
    const stats = await adminService.getOverviewStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

const getDailyStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDailyStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}
const getTopViewedPlaces = async (req, res, next) => {
  try {
    const places = await adminService.getTopViewedPlaces()
    res.status(StatusCodes.OK).json({
      success: true,
      data: places
    })
  } catch (error) {
    next(error)
  }
};

const getPopularStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPopularStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

const getFilteredReviews = async (req, res, next) => {
  try {
    const reviews = await adminService.getFilteredReviews(req.query, req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      data: reviews
    })
  } catch (error) {
    next(error)
  }
}

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const deletedReview = await adminService.deleteReview(id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: deletedReview
    })
  } catch (error) {
    next(error)
  }
}

const hideReview = async (req, res, next) => {
  try {
    const { id } = req.params
    const review = await adminService.hideReview(id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: review
    })
  } catch (error) {
    next(error)
  }
}

export const adminController = {
  getMe,
  getOverviewStats,
  getDailyStats,
  getPopularStats,
  getFilteredReviews,
  deleteReview,
  hideReview,
  getTopViewedPlaces
}
