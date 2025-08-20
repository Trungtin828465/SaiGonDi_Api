import BadgeModel from '~/models/Badges.model.js'
import { userBadgeService } from './userBadge.service.js'

/**
 * Lấy tất cả badges
 */
const getAllBadges = async () => {
  return await BadgeModel.find().sort({ createdAt: -1 })
}

const getAllBadgesWithProgress = async (userId) => {
  return await userBadgeService.getUserBadges(userId)
}

/**
 * Tạo badge mới
 */
const createBadge = async (badgeData) => {
  const newBadge = new BadgeModel(badgeData)
  return await newBadge.save()
}

/**
 * Cập nhật badge
 */
const updateBadge = async (badgeId, badgeData) => {
  return await BadgeModel.findByIdAndUpdate(badgeId, badgeData, { new: true })
}

/**
 * Xoá badge
 */
const deleteBadge = async (badgeId) => {
  return await BadgeModel.findByIdAndDelete(badgeId)
}


export const badgeService = {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getAllBadgesWithProgress
}