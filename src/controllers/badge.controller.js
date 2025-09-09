import { StatusCodes } from 'http-status-codes'
import { badgeService } from '../services/badge.service.js'
import PointHistory from '~/models/PointHistory.model.js'
import UserBadge from '~/models/UserBadge.model.js'

const getAllBadges = async (req, res, next) => {
  try {
    const badges = await badgeService.getAllBadges()
    res.status(StatusCodes.OK).json({ success: true, data: badges })
  } catch (error) {
    next(error)
  }
}

const getAllBadgesWithProgress = async (req, res, next) => {
  try {
    const userId = req.user._id
    const badges = await badgeService.getAllBadgesWithProgress(userId)
    res.status(StatusCodes.OK).json({ success: true, data: badges })
  } catch (error) {
    next(error)
  }
}

const createBadge = async (req, res, next) => {
  try {
    const newBadge = await badgeService.createBadge(req.body)
    res.status(StatusCodes.CREATED).json({ success: true, data: newBadge })
  } catch (error) {
    next(error)
  }
}

const updateBadge = async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedBadge = await badgeService.updateBadge(id, req.body)
    res.status(StatusCodes.OK).json({ success: true, data: updatedBadge })
  } catch (error) {
    next(error)
  }
}

export const getPointHistory = async (req, res) => {
  try {
    const userId = req.user.id // nếu bạn dùng middleware auth (JWT) thì lấy từ token
    const { page = 1, limit = 10 } = req.query

    const histories = await PointHistory.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('badgeId', 'name description pointsRequired') // lấy thêm thông tin huy hiệu

    const total = await PointHistory.countDocuments({ userId })

    // join với UserBadge
    const enrichedHistories = await Promise.all(
      histories.map(async (h) => {
        const userBadge = await UserBadge.findOne({
          userId,
          badgeId: h.badgeId._id
        })

        return {
          _id: h._id,
          userId: h.userId,
          badgeId: h.badgeId._id,
          badgeName: h.badgeId.name,
          action: h.action,
          points: h.points,
          createdAt: h.createdAt,
          // thêm vào
          currentPoints: userBadge?.currentPoints || 0,
          requiredPoints:
            userBadge?.requiredPoints || h.badgeId.pointsRequired || 0,
          status: userBadge?.status || 'in_progress'
        }
      })
    )

    res.json({
      success: true,
      data: enrichedHistories,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deleteBadge = async (req, res, next) => {
  try {
    const { id } = req.params
    await badgeService.deleteBadge(id)
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Badge deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const badgeController = {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getPointHistory,
  getAllBadgesWithProgress
}
