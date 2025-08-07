import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const idRule = Joi.object({
  id: Joi.string().pattern(OBJECT_ID_RULE).required().messages({
    'string.base': 'ID must be a string',
    'string.pattern.base': OBJECT_ID_RULE_MESSAGE
  })
})

const createNew = async (req, res, next) => {
  const validationRule = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.base': 'name must be a string',
      'string.empty': 'name cannot be empty',
      'string.min': 'name must be at least 3 characters long'
    }),
    description: Joi.string().min(10).required().messages({
      'string.base': 'description must be a string',
      'string.empty': 'description cannot be empty',
      'string.min': 'description must be at least 10 characters long'
    }),
    category: Joi.string().valid('restaurant', 'cafe', 'park', 'museum', 'shopping', 'other').required().messages({
      'string.base': 'category must be a string',
      'any.only': 'category must be one of restaurant, cafe, park, museum, shopping, or other'
    }),
    address: Joi.string().min(5).required().messages({
      'string.base': 'address must be a string',
      'string.empty': 'address cannot be empty',
      'string.min': 'address must be at least 5 characters long'
    }),
    district: Joi.string().min(2).required().messages({
      'string.base': 'district must be a string',
      'string.empty': 'district cannot be empty',
      'string.min': 'district must be at least 2 characters long'
    }),
    ward: Joi.string().min(2).required().messages({
      'string.base': 'ward must be a string',
      'string.empty': 'ward cannot be empty',
      'string.min': 'ward must be at least 2 characters long'
    }),
    location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required().messages({
      'object.base': 'location must be an object',
      'any.required': 'location is required'
    })
  })
  try {
    const data = req?.body ? req.body : {}
    await validationRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const getPlaceDetails = async (req, res, next) => {
  try {
    const data = req?.params ? req.params : {}
    await idRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const idValidate = async (req, res, next) => {
  try {
    const data = req?.params ? req.params : {}
    await idRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const likePlace = async (req, res, next) => {
  try {
    const data = req?.params ? req.params : {}
    await idRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const placeValidation = {
  createNew,
  getPlaceDetails,
  idValidate,
  likePlace
}
