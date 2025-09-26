import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import ServiceModel from '~/models/Service.model.js'

const createNew = async (serviceData) => {
  try {
    const newService = await ServiceModel.create({
      ...serviceData
    })
    return newService
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAllServices = async () => {
  try {
    const services = await ServiceModel.find({})
    return services
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updateService = async (serviceId, updateData) => {
  try {
    const updatedService = await ServiceModel.findByIdAndUpdate(serviceId, updateData, { new: true })
    if (!updatedService) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
    }
    return updatedService
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const deleteService = async (serviceId) => {
  try {
    const deletedService = await ServiceModel.findByIdAndDelete(serviceId)
    if (!deletedService) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found')
    }
    return deletedService
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const serviceService = {
  createNew,
  getAllServices,
  updateService,
  deleteService
}