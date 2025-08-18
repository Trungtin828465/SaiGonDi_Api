import mongoose from 'mongoose'
import Badge from '~/models/Badges.model.js'
import User from '~/models/User.model.js'
import UserBadge from '~/models/UserBadge.model.js'
import ApiError from '~/utils/ApiError'

/**
 * Cấp một huy hiệu đặc biệt (không dựa trên tích điểm) cho người dùng.
 * Thường dùng cho các hành động làm lần đầu.
 * @param {string} userId
 * @param {string} badgeId
 */
const grantSpecialBadge = async (userId, badgeId) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const badge = await Badge.findById(badgeId).session(session)
    if (!badge || badge.type !== 'special') {
      throw new ApiError(404, 'Special badge not found or type is mismatched.')
    }

    // Kiểm tra xem user đã có huy hiệu này chưa
    const existingUserBadge = await UserBadge.findOne({ userId, badgeId }).session(session)
    if (existingUserBadge) {
      // Người dùng đã có huy hiệu này, không làm gì cả
      await session.abortTransaction()
      session.endSession()
      return
    }

    // Cấp huy hiệu
    const userBadge = new UserBadge({
      userId,
      badgeId,
      currentPoints: badge.pointsRequired, // Huy hiệu đặc biệt hoàn thành ngay
      requiredPoints: badge.pointsRequired,
      status: 'earned',
      achievedAt: new Date()
    })
    await userBadge.save({ session })

    // Cộng điểm tổng cho người dùng
    await User.findByIdAndUpdate(userId, { $inc: { points: badge.pointsRequired } }, { session })

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

/**
 * Cộng điểm vào tiến trình của một huy hiệu cho người dùng.
 * Nếu đủ điểm, hoàn thành huy hiệu và cộng điểm tổng cho người dùng.
 * @param {string} userId
 * @param {string} badgeId
 * @param {number} pointsToAdd
 */
const addPointsToBadge = async (userId, badgeId, pointsToAdd) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const badge = await Badge.findById(badgeId).session(session)
    if (!badge || badge.type !== 'points') {
      throw new ApiError(404, 'Points badge not found or type is mismatched.')
    }

    let userBadge = await UserBadge.findOne({ userId, badgeId }).session(session)

    // Nếu đã hoàn thành rồi thì không làm gì nữa
    if (userBadge && userBadge.status === 'earned') {
      await session.abortTransaction()
      session.endSession()
      return
    }

    // Nếu chưa có, tạo mới
    if (!userBadge) {
      userBadge = new UserBadge({
        userId,
        badgeId,
        currentPoints: 0,
        requiredPoints: badge.pointsRequired,
        status: 'in_progress'
      })
    }

    // Cộng điểm
    userBadge.currentPoints += pointsToAdd

    // Nếu vượt quá điểm yêu cầu, gán bằng điểm yêu cầu
    if (userBadge.currentPoints > userBadge.requiredPoints) {
      userBadge.currentPoints = userBadge.requiredPoints
    }

    // Kiểm tra hoàn thành
    if (userBadge.currentPoints >= userBadge.requiredPoints) {
      userBadge.status = 'earned'
      userBadge.achievedAt = new Date()
      // Cộng điểm tổng cho người dùng CHỈ KHI huy hiệu được hoàn thành
      await User.findByIdAndUpdate(userId, { $inc: { points: userBadge.requiredPoints } }, { session })
    }

    await userBadge.save({ session })

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

/**
 * Lấy danh sách tất cả huy hiệu cùng với tiến trình của người dùng.
 * @param {string} userId
 * @returns {Promise<any[]>}
 */
/**
 * Lấy danh sách tất cả huy hiệu cùng với tiến trình của người dùng.
 * @param {string} userId
 * @returns {Promise<any[]>}
 */
const getBadgesForUser = async (userId) => {
  // Lấy tất cả huy hiệu đang hoạt động và tiến trình của người dùng cho các huy hiệu đó
  const allBadges = await Badge.find({ isActive: true }).lean()
  const userBadges = await UserBadge.find({ userId: userId }).lean()

  // Tạo một map để truy cập tiến trình của người dùng một cách hiệu quả
  const userBadgesMap = userBadges.reduce((acc, ub) => {
    // Chuyển badgeId thành chuỗi để làm key
    acc[ub.badgeId.toString()] = ub
    return acc
  }, {})

  // Kết hợp thông tin huy hiệu với tiến trình của người dùng
  const result = allBadges.map(badge => {
    const userBadgeData = userBadgesMap[badge._id.toString()]

    return {
      ...badge,
      userProgress: {
        status: userBadgeData?.status || 'locked',
        currentPoints: userBadgeData?.currentPoints || 0,
        achievedAt: userBadgeData?.achievedAt || null
      }
    }
  })

  return result
}

export const userBadgeService = {
  grantSpecialBadge,
  addPointsToBadge,
  getBadgesForUser
}