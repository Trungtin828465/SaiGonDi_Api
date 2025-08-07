import { StatusCodes } from 'http-status-codes'
import { placeService } from '~/services/place.service.js'

const createNew = async (req, res, next) => {
  try {
    const userId = req.user.id
    const role = req.user.role
    const newPlace = await placeService.createNew(req.body, userId, role === 'admin' ? userId : null)
    res.status(StatusCodes.CREATED).json({
      message: 'Place created successfully',
      data: newPlace
    })
  } catch (error) {
    next(error)
  }
}

const getAllPlaces = async (req, res, next) => {
  try {
    const placeList = await placeService.getAllPlaces(req.body)
    res.status(StatusCodes.OK).json({
      message: 'Place list retrieved successfully',
      data: placeList
    })
  } catch (error) {
    next(error)
  }
}

const getApprovedPlaces = async (req, res, next) => {
  try {
    const approvedPlaces = await placeService.getApprovedPlaces()
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': approvedPlaces
    })
  } catch (error) {
    next(error)
  }
}

const getPlaceDetails = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const placeDetails = await placeService.getPlaceDetails(placeId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': placeDetails
    })
  } catch (error) {
    next(error)
  }
}

const updatePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const updatedPlace = await placeService.updatePlace(placeId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Đã cập nhật địa điểm thành công',
      data: updatedPlace
    })
  } catch (error) {
    next(error)
  }
}

const destroyPlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    await placeService.destroyPlace(placeId)
    res.status(StatusCodes.OK).json({
      message: 'Đã xóa địa điểm thành công'
    })
  } catch (error) {
    next(error)
  }
}

const likePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    await placeService.likePlace(placeId, userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã thích địa điểm thành công'
    })
  }
  catch (error) {
    next(error)
  }
}

export const placeController = {
  createNew,
  getAllPlaces,
  getApprovedPlaces,
  getPlaceDetails,
  updatePlace,
  destroyPlace,
  likePlace
}