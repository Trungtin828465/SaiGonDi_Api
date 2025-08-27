import { userBadgeService } from '~/services/userBadge.service.js'
import PointHistory from '~/models/PointHistory.model.js'
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
      .populate('badgeId', 'name description') // lấy thêm thông tin huy hiệu

    const total = await PointHistory.countDocuments({ userId })

    res.json({
      success: true,
      data: histories,
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