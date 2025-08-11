import UserModel from '~/models/User.model.js'
import BadgeModel from '~/models/Badges.model.js'
import ReviewModel from '~/models/Review.model.js'
import CheckinModel from '~/models/Checkin.model.js'
import BlogModel from '~/models/Blog.model.js'
import PlaceModel from '~/models/Place.model.js'

/**
 * Kiểm tra và trao badges cho user dựa vào points hoặc condition
 * @param {String} userId 
 */
const checkAndAwardBadges = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) return

    const userPoints = user.points || 0

    // Lấy tất cả badges đang active
    const badges = await BadgeModel.find({ isActive: true })

    for (const badge of badges) {
      let eligible = false

      if (badge.type === 'points') {
        // Badge dựa vào điểm
        if (userPoints >= badge.pointsRequired) {
          eligible = true
        }
      } else if (badge.type === 'special' && badge.condition) {
        // Badge đặc biệt dựa vào condition.action và condition.count
        const { action, count } = badge.condition

        let actionCount = 0
        switch (action) {
          case 'review':
            actionCount = await ReviewModel.countDocuments({ userId })
            break
          case 'checkin':
            actionCount = await CheckinModel.countDocuments({ userId })
            break
          case 'blog':
            actionCount = await BlogModel.countDocuments({ authorId: userId })
            break
          case 'place':
            actionCount = await PlaceModel.countDocuments({ createdBy: userId })
            break
          default:
            break
        }

        if (actionCount >= count) {
          eligible = true
        }
      }

      // Nếu đủ điều kiện và chưa có badge thì thêm vào
      if (eligible) {
        const alreadyHasBadge = user.badges?.some(
          id => id.toString() === badge._id.toString()
        )
        if (!alreadyHasBadge) {
          user.badges.push(badge._id)
        }
      }
    }

    await user.save()
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error)
  }
}

/**
 * Lấy tất cả badges
 */
const getAllBadges = async () => {
  try {
    return await BadgeModel.find().sort({ createdAt: -1 })
  } catch (error) {
    throw error
  }
}

/**
 * Tạo badge mới
 */
const createBadge = async (badgeData) => {
  try {
    const newBadge = new BadgeModel(badgeData)
    return await newBadge.save()
  } catch (error) {
    throw error
  }
}

/**
 * Cập nhật badge
 */
const updateBadge = async (badgeId, badgeData) => {
  try {
    return await BadgeModel.findByIdAndUpdate(badgeId, badgeData, { new: true })
  } catch (error) {
    throw error
  }
}

/**
 * Xoá badge
 */
const deleteBadge = async (badgeId) => {
  try {
    await BadgeModel.findByIdAndDelete(badgeId)
  } catch (error) {
    throw error
  }
}

export const badgeService = {
  checkAndAwardBadges,
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge
}
