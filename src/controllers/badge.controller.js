import { StatusCodes } from 'http-status-codes'
import { badgeService } from '../services/badge.service.js'

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
    const userId = req.user._id;
    const badges = await badgeService.getAllBadgesWithProgress(userId);
    res.status(StatusCodes.OK).json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
};

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

const deleteBadge = async (req, res, next) => {
  try {
    const { id } = req.params
    await badgeService.deleteBadge(id)
    res.status(StatusCodes.OK).json({ success: true, message: 'Badge deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export const badgeController = {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getAllBadgesWithProgress
}