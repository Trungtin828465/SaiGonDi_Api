import { adminService } from '../services/admin.service.js'
import { StatusCodes } from 'http-status-codes'

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
  getOverviewStats,
  getDailyStats,
  getPopularStats,
  getFilteredReviews,
  deleteReview,
  hideReview
}
