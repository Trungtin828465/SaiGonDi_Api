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
<<<<<<< HEAD
    // Tìm key điều kiện khớp với hành động (không phân biệt hoa thường)
    const normalizedAction = action.toLowerCase().replace(/[-_]/g, '');
    const matchedActionKey = Object.keys(condition).find(
      (key) => key.toLowerCase().replace(/[-_]/g, '') === normalizedAction
=======
    const normalizedAction = action.replace(/[-_]/g, '').toLowerCase()

    const matchedActionKey = Object.keys(condition).find(
      (key) => key.replace(/[-_]/g, '').toLowerCase() === normalizedAction
>>>>>>> c9b4a797654c1d145110abf60f830bd170f83cd5
    )

    if (!matchedActionKey) continue

    const canonicalActionName = normalizedAction
    const actionCondition = condition[matchedActionKey]

    // 1. Xử lý huy hiệu loại 'special' (thường là làm lần đầu)
    if (badge.type === 'special' && actionCondition.firstTime === true) {
      const actionCount = await PointHistory.countDocuments({
        userId,
        badgeId: badge._id,
        action: canonicalActionName // SỬA LỖI: Dùng tên đã chuẩn hóa
      })

      if (actionCount === 0) {
        await userBadgeService.grantSpecialBadge(userId, badge._id)
        await PointHistory.create({
          userId,
          badgeId: badge._id,
          action: canonicalActionName, // SỬA LỖI: Dùng tên đã chuẩn hóa
          points: badge.pointsRequired,
          meta
        })
      }
    }

    // 2. Xử lý huy hiệu loại 'points' (tích điểm)
    if (badge.type === 'points') {
      const pointsToAdd = parseInt(actionCondition.points || actionCondition.point, 10)
      if (isNaN(pointsToAdd) || pointsToAdd <= 0) continue

      const targetCount = parseInt(actionCondition.count || actionCondition.Count, 10)

      if (!isNaN(targetCount) && targetCount > 0) {
        const actionCount = await PointHistory.countDocuments({
          userId,
          badgeId: badge._id,
          action: canonicalActionName
        })

        const currentActionNumber = actionCount + 1
        let pointsAwarded = 0

        if (currentActionNumber === targetCount) {
          await userBadgeService.addPointsToBadge(userId, badge._id, pointsToAdd)
          pointsAwarded = pointsToAdd
        }

        await PointHistory.create({
          userId,
          badgeId: badge._id,
          action: canonicalActionName,
          points: pointsAwarded,
          meta
        })
      } else {
        await userBadgeService.addPointsToBadge(userId, badge._id, pointsToAdd)
        await PointHistory.create({
          userId,
          badgeId: badge._id,
          action: canonicalActionName,
          points: pointsToAdd,
          meta
        })
      }
    }
  }
}


export const badgeActionService = {
  handleUserAction
}