import { userBadgeService } from '~/services/userBadge.service.js'
import PointHistory from '~/models/PointHistory.model.js'
import UserBadge from '~/models/UserBadge.model.js'

const getBadges = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { status } = req.query

    const allBadgesWithProgress = await userBadgeService.getBadgesForUser(userId)

    let result = allBadgesWithProgress

    if (status === 'earned') {
      result = allBadgesWithProgress.filter(b => b.userProgress.status === 'earned')
    } else if (status === 'unearned') {
      result = allBadgesWithProgress.filter(b => b.userProgress.status !== 'earned')
    }

    res.status(200).json({
      message: 'Successfully fetched badges.',
      data: result
    })
  } catch (error) {
    next(error)
  }
}
const getPointHistory = async (req, res) => {
  try {
    const userId = req.user.id // nếu bạn dùng middleware auth (JWT) thì lấy từ token
    const { page = 1, limit = 10 } = req.query

    const histories = await PointHistory.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('badgeId', 'name description pointsRequired') // lấy thêm thông tin huy hiệu

    const total = await PointHistory.countDocuments({ userId })

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
          currentPoints: userBadge?.currentPoints || 0,
          requiredPoints: userBadge?.requiredPoints || h.badgeId.pointsRequired || 0,
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


export const userBadgeController = {
  getBadges,
  getPointHistory
}