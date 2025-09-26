import { StatusCodes } from 'http-status-codes'
import { serviceService} from '~/services/services.service.js'

const createNew = async (req, res, next) => {
  try {
    const newService = await serviceService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Service created successfully',
      data: newService
    })
  } catch (error) {
    next(error)
  }
}

const getAllServices = async (req, res, next) => {
  try {
    const services = await serviceService.getAllServices()
    res.status(StatusCodes.OK).json({
      message: 'Services retrieved successfully',
      data: services
    })
  } catch (error) {
    next(error)
  }
}

const updateService = async (req, res, next) => {
  try {
    const serviceId = req.params.id
    const updatedService = await serviceService.updateService(serviceId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Category updated successfully',
      data: updatedService
        })
    } catch (error) {
        next(error)
  }
}

const deleteService = async (req, res, next) => {
  try {
    const serviceId = req.params.id
    const deletedService = await serviceService.deleteService(serviceId)
    res.status(StatusCodes.OK).json({
      message: 'Service deleted successfully',
      data: deletedService
    })
  } catch (error) {
    next(error)
  }
}

export const serviceController = {
  createNew,
  getAllServices,
  updateService,
  deleteService
}