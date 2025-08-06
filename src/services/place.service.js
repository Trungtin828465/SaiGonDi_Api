import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import PlaceModel from '~/models/Place.model.js'

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
    return places
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

export const placeService = {
  createNew,
  getAllPlaces,
  getApprovedPlaces,
  getPlaceDetails,
  updatePlace,
  destroyPlace
}
