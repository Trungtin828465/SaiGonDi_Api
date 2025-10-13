import { StatusCodes } from 'http-status-codes'
import { placeService } from '~/services/place.service.js'
import SearchLogModel from '~/models/SearchLog.model.js'


const createNew = async (req, res, next) => {
  try {
    const userId = req.user.id
    const newPlace = await placeService.createNew(req.body, userId ? userId : null)

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
    const placeList = await placeService.getAllPlaces(req.query)
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
    const approvedPlaces = await placeService.getApprovedPlaces(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': approvedPlaces
    })
  } catch (error) {
    next(error)
  }
}

const getPlacesMapdata = async (req, res, next) => {
  try {
    const mapData = await placeService.getPlacesMapdata(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': mapData
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

const addToFavorites = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const user = await placeService.addToFavorites(placeId, userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã thêm địa điểm vào yêu thích thành công',
      user
    })
  } catch (error) {
    next(error)
  }
}

const addViewCount = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const place = await placeService.addViewCount(placeId)
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã tăng view count thành công',
      place
    })
  } catch (error) {
    next(error)
  }
}

const removeFromFavorites = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const user = await placeService.removeFromFavorites(placeId, userId)
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã xóa địa điểm khỏi yêu thích thành công',
      user
    })
  } catch (error) {
    next(error)
  }
}

const checkinPlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const userId = req.user.id
    const data = req.body
    const { note, device, imgList } = req.body;
    const checkinData = await placeService.checkinPlace(placeId, userId, {
      note,
      device,
      imgList
    });
    res.status(StatusCodes.OK).json({
      'success': true,
      message: 'Đã check-in thành công',
      data: checkinData
    })
  } catch (error) {
    next(error)
  }
}

const approvePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const adminId = req.user.id
    const approvedPlace = await placeService.approvePlace(placeId, adminId)
    res.status(StatusCodes.OK).json({
      message: 'Địa điểm đã được phê duyệt thành công',
      data: approvedPlace
    })
  } catch (error) {
    next(error)
  }
}

const updatePlaceCoordinates = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const { latitude, longitude } = req.body
    const updatedPlace = await placeService.updatePlaceCoordinates(placeId, latitude, longitude)

    res.status(StatusCodes.OK).json({
      message: 'Đã cập nhật tọa độ địa điểm thành công',
      data: updatedPlace
    })
  } catch (error) {
    next(error)
  }
}


const getAdminPlaceDetails = async (req, res, next) => {
  try {
    const placeId = req.params.id
    const placeDetails = await placeService.getAdminPlaceDetails(placeId)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': placeDetails
    })
  } catch (error) {
    next(error)
  }
}

const getNearbyPlaces = async (req, res, next) => {
  try {
    const nearbyPlaces = await placeService.getNearbyPlaces(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': nearbyPlaces
    })
  } catch (error) {
    next(error)
  }
}

const searchPlaces = async (req, res, next) => {
  try {
    if (req.query.query) {
      const keyword = req.query.query.toString().trim()
      if (keyword) {
        SearchLogModel.create({ keyword }).catch(err => console.error('Failed to log search keyword:', err));
      }
    }
    const filteredPlaces = await placeService.searchPlaces(req.query)
    res.status(StatusCodes.OK).json({
      'success': true,
      'data': filteredPlaces
    })
  } catch (error) {
    next(error)
  }
}
const getHotPlaces = async (req, res, next) => {
  try {
    const hotPlaces = await placeService.getHotPlaces();
    res.status(StatusCodes.OK).json({
      success: true,
      data: hotPlaces
    });
  } catch (error) {
    next(error);
  }
};


export const placeController = {
  createNew,
  getAllPlaces,
  getApprovedPlaces,
  searchPlaces,
  getPlaceDetails,
  updatePlace,
  destroyPlace,
  addViewCount,
  likePlace,
  addToFavorites,
  removeFromFavorites,
  checkinPlace,
  approvePlace,
  updatePlaceCoordinates,
  getAdminPlaceDetails,
  getPlacesMapdata,
  getNearbyPlaces,
  getHotPlaces
}