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

export const adminController = {
  getOverviewStats,
  getDailyStats,
  getPopularStats
}
