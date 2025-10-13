import { StatusCodes } from 'http-status-codes'
import { hotService } from '~/services/hot.service.js'

const getHotData = async (req, res, next) => {
  try {
    const hotData = await hotService.getHotData()
    res.status(StatusCodes.OK).json({
      message: 'Hot data retrieved successfully',
      data: hotData
    })
  } catch (error) {
    next(error)
  }
}

const getTopSearchKeywords = async (req, res, next) => {
  try {
    const topKeywords = await hotService.getTopSearchKeywords()
    res.status(StatusCodes.OK).json({
      message: 'Top search keywords retrieved successfully',
      data: topKeywords
    })
  } catch (error) {
    next(error)
  }
}

export const hotController = {
  getHotData,
  getTopSearchKeywords
}