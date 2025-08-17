import UserModel from '~/models/User.model.js'
import PlaceModel from '~/models/Place.model.js'
import BlogModel from '~/models/Blog.model.js'
import BlogCommentModel from '~/models/BlogComment.model.js'
const getOverviewStats = async () => {
  try {
    const userCount = await UserModel.countDocuments()
    const placeCount = await PlaceModel.countDocuments()
    const blogCount = await BlogModel.countDocuments()

    return {
      users: userCount,
      places: placeCount,
      blogs: blogCount
    }
  } catch (error) {
    throw error
  }
}

const getDailyStats = async () => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const daily = await BlogModel.countDocuments({ createdAt: { $gte: today } })
    const weekly = await BlogModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const monthly = await BlogModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })

    return {
      daily,
      weekly,
      monthly
    }
  } catch (error) {
    throw error
  }
}

const getPopularStats = async () => {
  try {
    const popularPlaces = await PlaceModel.find({ status: 'approved' })
      .sort({ avgRating: -1, totalRatings: -1, totalLikes: -1 })
      .limit(5)
      .select('name avgRating totalRatings')

    const popularBlogs = await BlogModel.aggregate([
      {
        $lookup: {
          from: 'blogcomments',
          localField: '_id',
          foreignField: 'blogId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $addFields: {
          // Trọng số: view=1, like=3, comment=5, share=8 (có thể điều chỉnh)
          popularityScore: {
            $add: [
              { $multiply: ['$viewCount', 1] },
              { $multiply: ['$totalLikes', 3] },
              { $multiply: ['$commentCount', 5] },
              { $multiply: ['$shareCount', 8] }
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          totalLikes: 1,
          viewCount: 1,
          shareCount: 1,
          commentCount: 1,
          popularityScore: 1
        }
      },
      {
        $sort: { popularityScore: -1 }
      },
      { $limit: 5 }
    ])

    return {
      popularPlaces,
      popularBlogs
    }
  } catch (error) {
    throw error
  }
}


export const adminService = {
  getOverviewStats,
  getDailyStats,
  getPopularStats
}
