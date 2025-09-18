import { StatusCodes } from 'http-status-codes'
import { placeService } from '~/services/place.service.js'
import { blogService } from '~/services/blog.service.js'

const getHotData = async (req, res, next) => {
  try {
    const hotPlace = await placeService.getHotPlaces(1)
    const hotBlogs = await blogService.getHotBlogs(2)

    res.status(StatusCodes.OK).json({
      message: 'Hot data retrieved successfully',
      data: {
        hotPlace: hotPlace[0] || null,
        hotBlogs: hotBlogs || []
      }
    })
  } catch (error) {
    next(error)
  }
}

export const hotController = {
  getHotData
}
