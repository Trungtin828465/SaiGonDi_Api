import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/user.service'
import { placeService } from '~/services/place.service'

const getSuggestedPlaces = async (req, res, next) => {
  try {
    const userId = req.user.id
    const suggestedPlaces = await placeService.getUserSuggestedPlaces(userId)
    res.status(StatusCodes.OK).json({
      message: 'Suggested places retrieved successfully',
      data: suggestedPlaces
    })
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const profile = await userService.getUserProfile(userId)
    res.status(StatusCodes.OK).json({
      message: 'Profile retrieved successfully',
      data: profile
    })
  } catch (error) {
    next(error)
  }
}

const getFavoritePlaces = async (req, res, next) => {
  try {
    const userId = req.user.id
    const favoritePlaces = await placeService.getFavoritePlaces(userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': favoritePlaces
    })
  } catch (error) {
    next(error)
  }
}

const getUserCheckins = async (req, res, next) => {
  try {
    const userId = req.user.id
    const checkins = await placeService.getUserCheckins(userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': checkins
    })
  } catch (error) {
    next(error)
  }
}

const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user.id
    const reviews = await userService.getUserReviews(userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': reviews
    })
  } catch (error) {
    next(error)
  }
}

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const updatedProfile = await userService.updateUserProfile(userId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Profile updated successfully',
      data: updatedProfile
    })
  } catch (error) {
    next(error)
  }
}

export const profileController = {
  getSuggestedPlaces,
  getProfile,
  getFavoritePlaces,
  getUserCheckins,
  getUserReviews,
  updateProfile
}