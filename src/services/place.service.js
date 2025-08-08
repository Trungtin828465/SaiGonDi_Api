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

const getApprovedPlaces = async () => {
  try {
    const places = await PlaceModel.find({ status: 'approved' })
    const returnPlaces = places.map(place => ({
      id: place._id,
      name: place.name,
      address: place.address,
      category: place.category
    }))
    return returnPlaces
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAllPlaces = async () => {
  try {
    const places = await PlaceModel.find()
    return places
  }
  catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getPlaceDetails = async (placeId) => {
  try {
    const place = await PlaceModel.findById(placeId)
    if (!place || place.status !== 'approved') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Place not found')
    }
    return place
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

export const placeService = {
  createNew,
  getAllPlaces,
  getApprovedPlaces,
  getPlaceDetails,
  updatePlace,
  destroyPlace,
  likePlace,
  addToFavorites,
  removeFromFavorites,
  checkinPlace
}
