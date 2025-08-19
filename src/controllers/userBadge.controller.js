import { userBadgeService } from '~/services/userBadge.service.js'

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

export const userBadgeController = {
  getBadges
}