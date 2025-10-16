import SearchLogModel from '~/models/SearchLog.model.js'
import { placeService } from '~/services/place.service.js'
import { blogService } from '~/services/blog.service.js'

const getTopSearchKeywords = async () => {
  try {
    // Get date for 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const topKeywords = await SearchLogModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$keyword',
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 0,
          keyword: '$_id',
          count: 1
        }
      }
    ])

    return topKeywords
  } catch (error) {
    throw error
  }
}

const getHotData = async () => {
  try {
    const hotPlace = await placeService.getHotPlaces(1)
    const hotBlogs = await blogService.getHotBlogs(2)

    return {
      hotPlace: hotPlace[0] || null,
      hotBlogs: hotBlogs || []
    }
  } catch (error) {
    throw error
  }
}


export const hotService = {
  getTopSearchKeywords,
  getHotData
}
