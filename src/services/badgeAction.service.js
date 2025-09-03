import Badge from '~/models/Badge.model.js'
import PointHistory from '~/models/PointHistory.model.js'
import { userBadgeService } from '~/services/userBadge.service.js'

/**
 * Xử lý một hành động của người dùng, kiểm tra xem nó có đủ điều kiện cho bất kỳ huy hiệu nào không.
 * @param {string} userId - ID của người dùng thực hiện hành động.
 * @param {string} action - Tên của hành động (ví dụ: 'createReview').
 * @param {object} meta - Dữ liệu bổ sung liên quan đến hành động.
 */
const handleUserAction = async (userId, action, meta = {}) => {
  // Lấy tất cả huy hiệu đang hoạt động
  const badges = await Badge.find({ isActive: true })

  for (const badge of badges) {
    const condition = badge.condition || {}
    // Tìm key điều kiện khớp với hành động (không phân biệt hoa thường)
    const normalizedAction = action.toLowerCase().replace(/[-_]/g, '');
    const matchedActionKey = Object.keys(condition).find(
      (key) => key.toLowerCase().replace(/[-_]/g, '') === normalizedAction
    )

    // Nếu huy hiệu này không có điều kiện cho hành động này, bỏ qua
    if (!matchedActionKey) continue

    const actionCondition = condition[matchedActionKey]

    // 1. Xử lý huy hiệu loại 'special' (thường là làm lần đầu)
    if (badge.type === 'special' && actionCondition.firstTime === true) {
      const actionCount = await PointHistory.countDocuments({
        userId,
        badgeId: badge._id,
        action: matchedActionKey
      })

      // Nếu chưa từng làm hành động này, cấp huy hiệu và ghi lại lịch sử
      if (actionCount === 0) {
        await userBadgeService.grantSpecialBadge(userId, badge._id)
        await PointHistory.create({
          userId,
          badgeId: badge._id,
          action: matchedActionKey,
          points: badge.pointsRequired, // Ghi lại số điểm đã nhận
          meta
        })
      }
    }

    // 2. Xử lý huy hiệu loại 'points' (tích điểm)
    if (badge.type === 'points') {
      const pointsToAdd = parseInt(actionCondition.points || actionCondition.point, 10)
      if (isNaN(pointsToAdd) || pointsToAdd <= 0) continue

      // Kiểm tra giới hạn số lần thực hiện (nếu có)
      const countLimit = parseInt(actionCondition.count || actionCondition.Count, 10)
      if (!isNaN(countLimit) && countLimit > 0) {
        const actionCount = await PointHistory.countDocuments({
          userId,
          badgeId: badge._id,
          action: matchedActionKey
        })

        // Nếu đã đạt hoặc vượt giới hạn, không cộng điểm nữa
        if (actionCount >= countLimit) {
          continue
        }
      }

      // Cộng điểm và ghi lại lịch sử
      await userBadgeService.addPointsToBadge(userId, badge._id, pointsToAdd)
      await PointHistory.create({
        userId,
        badgeId: badge._id,
        action: matchedActionKey,
        points: pointsToAdd,
        meta
      })
    }
  }
}

const getPointHistoryByUserId = async (userId) => {
  const history = await PointHistory.find({ userId }).sort({ createdAt: -1 })
  return history
}
export const badgeActionService = {
  handleUserAction,
  getPointHistoryByUserId
}
