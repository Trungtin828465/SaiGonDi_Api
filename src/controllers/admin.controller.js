import { adminService } from '../services/admin.service.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import UserModel from '../models/User.model.js'

const getMe = async (req, res, next) => {
  try {
    const adminId = req.user?.id
    if (!adminId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy ID trong token')
    }

    const admin = await UserModel.findById(adminId)
      .select('firstName lastName fullName email avatar role')

    if (!admin || admin.role !== 'admin') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập hoặc admin không tồn tại')
    }

    res.status(StatusCodes.OK).json({
      id: admin._id,
      email: admin.email,
      fullName: admin.fullName || `${admin.firstName} ${admin.lastName}`,
      avatar: admin.avatar,
      role: admin.role
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
  hideReview
}
