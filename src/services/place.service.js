import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { mongoose } from 'mongoose'
import PlaceModel from '~/models/Place.model.js'
import UserModel from '~/models/User.model.js'

const createNew = async (placeData, userId, adminId) => {
  try {
    const newPlace = await PlaceModel.create({
      ...placeData,
      createdBy: userId,
      verifiedBy: adminId,
      status: adminId ? 'approved' : 'pending'
    })
    return newPlace
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getApprovedPlaces = async (queryParams) => {
  try {
    const sortByMapping = {
      // location: 'location',
      latest: 'createdAt',
      rating: 'avgRating'
    }
    const page = parseInt(queryParams.page, 10) || 1
    const limit = parseInt(queryParams.limit, 10) || 10
    const startIndex = (page - 1) * limit

    const sortBy = queryParams.sortBy || 'createdAt'
    const sortOrder = queryParams.sortOrder === 'desc' ? -1 : 1
    const places = await PlaceModel.find({ status: 'approved' })
      .populate({
        path: 'categories',
        select: 'name icon'
      })
      .sort({ [sortByMapping[sortBy]]: sortOrder })
      .skip(startIndex)
      .limit(limit)
      .select('name address avgRating')

    const total = await PlaceModel.countDocuments({ status: 'approved' })

    const returnPlaces = {
      places,
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit)
      }
    }
    return returnPlaces
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAllPlaces = async (queryParams) => {
  try {
    const sortByMapping = {
      // location: 'location',
      latest: 'createdAt',
      rating: 'avgRating'
    }
    const page = parseInt(queryParams.page, 10) || 1
    const limit = parseInt(queryParams.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const sortBy = queryParams.sortBy || 'createdAt'
    const sortOrder = queryParams.sortOrder === 'desc' ? -1 : 1
    const places = await PlaceModel.find()
      .populate({
        path: 'categories',
        select: 'name icon'
      })
      .sort({ [sortByMapping[sortBy]]: sortOrder })
      .skip(startIndex)
      .limit(limit)
    const total = await PlaceModel.countDocuments()
    return {
      places,
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getPlaceDetails = async (placeId) => {
  try {
    const place = await PlaceModel.find({ _id: placeId, status: 'approved' })
      .populate({
        path: 'categories',
        select: 'name icon description'
      })
      .populate({
        path: 'likeBy',
        select: 'firstName lastName avatar'
      })
      .select('categories status name description address district ward avgRating totalRatings totalLikes likeBy')
    const returnPlace = place[0] || null
    if (!returnPlace || returnPlace.status !== 'approved') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Place not found')
    }
    return returnPlace
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updatePlace = async (placeId, updateData) => {
  try {
    const updatedPlace = await PlaceModel.findByIdAndUpdate(placeId, {
      ...updateData,
      updatedAt: new Date()
    }, { new: true })
    if (!updatedPlace) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Place not found')
    }
    return updatedPlace
  }
  catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const destroyPlace = async (placeId) => {
  try {
    return await updatePlace(placeId, { status: 'hidden' })
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const likePlace = async (placeId, userId) => {
  try {
    const place = await PlaceModel.findById(placeId)
    if (!place || place.status !== 'approved') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Place not found')
    }
    if (place.likeBy.includes(new mongoose.Types.ObjectId(userId))) {
      place.likeBy.pull(new mongoose.Types.ObjectId(userId))
    } else {
      place.likeBy.push(new mongoose.Types.ObjectId(userId))
    }
    await place.save()
    await place.updateTotalLikes()
    return place
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const addToFavorites = async (placeId, userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.favorites.includes(placeId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Place already in favorites')
    }
    user.favorites.push(placeId)
    await user.save()
    return user
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const removeFromFavorites = async (placeId, userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (!user.favorites.includes(placeId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Place not in favorites')
    }
    user.favorites.pull(placeId)
    await user.save()
    return user
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const checkinPlace = async (placeId, userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.checkins.includes(placeId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User already checked in to this place')
    }
    user.checkins.push(placeId)
    await user.save()
    return user
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getFavoritePlaces = async (userId) => {
  try {
    const user = await UserModel.findById(userId).populate('favorites')
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    return user.favorites
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const approvePlace = async (placeId, adminId) => {
  try {
    const place = await PlaceModel.findById(placeId)
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
    }
    if (place.status === 'approved') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Địa điểm đã được phê duyệt.')
    }
    place.status = 'approved'
    place.verifiedBy = adminId
    await place.save()
    return place
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updatePlaceCoordinates = async (placeId, coordinates) => {
  try {
    const place = await PlaceModel.findById(placeId)
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
    }
    place.location.coordinates = coordinates
    await place.save()
    return place
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAdminPlaceDetails = async (placeId) => {
  try {
    const place = await PlaceModel.findById(placeId)
      .populate({
        path: 'categories',
        select: 'name icon description'
      })
      .populate({
        path: 'likeBy',
        select: 'firstName lastName avatar'
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'verifiedBy',
        select: 'firstName lastName email'
      })
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa điểm.')
    }
    return place
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const placeService = {
  createNew,
  getAllPlaces,
  getApprovedPlaces,
  getAdminPlaceDetails,
  getPlaceDetails,
  updatePlace,
  destroyPlace,
  likePlace,
  addToFavorites,
  removeFromFavorites,
  checkinPlace,
  getFavoritePlaces,
  approvePlace,
  updatePlaceCoordinates
}
