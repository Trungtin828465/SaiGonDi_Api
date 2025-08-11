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
    categories: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).required().messages({
      'string.base': 'categories must be a string',
      'string.empty': 'categories cannot be empty',
      'string.pattern.base': OBJECT_ID_RULE_MESSAGE
    })).required().messages({
      'array.base': 'categories must be an array',
      'array.items': 'categories must contain valid ObjectId strings'
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
      coordinates: Joi.array().items(
        Joi.number()
          .min(-180)
          .max(180)
          .precision(8)
          .required()
          .messages({
            'number.base': 'longitude must be an array of numbers',
            'number.min': 'longitude must be between -180 and 180',
            'number.max': 'longitude must be between -180 and 180' 
          }),
        Joi.number()
          .min(-90)
          .max(90)
          .precision(8)
          .required()
          .messages({
            'number.base': 'latitude must be an array of numbers',
            'number.min': 'latitude must be between -90 and 90',
            'number.max': 'latitude must be between -90 and 90'
          })
      )
        .length(2).required().messages({
          'array.base': 'coordinates must be an array',
          'array.length': 'coordinates must contain exactly 2 numbers',
          'array.items': 'coordinates must be an array of longitude between -180 and 180 and latitude between -90 and 90'
        })
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

const pagingValidate = async (req, res, next) => {
  const pagingRule = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('latest', 'rating', 'location').default('latest'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
  try {
    const data = req?.query ? req.query : {}
    await pagingRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updatePlaceCoordinates = async (req, res, next) => {
  const validationRule = Joi.object({
    coordinates: Joi.array().items(
      Joi.number()
        .min(-180)
        .max(180)
        .precision(8)
        .required()
        .messages({
          'number.base': 'longitude must be an array of numbers',
          'number.min': 'longitude must be between -180 and 180',
          'number.max': 'longitude must be between -180 and 180' 
        }),
      Joi.number()
        .min(-90)
        .max(90)
        .precision(8)
        .required()
        .messages({
          'number.base': 'latitude must be an array of numbers',
          'number.min': 'latitude must be between -90 and 90',
          'number.max': 'latitude must be between -90 and 90'
        })
    )
      .length(2).required().messages({
        'array.base': 'coordinates must be an array',
        'array.length': 'coordinates must contain exactly 2 numbers',
        'array.items': 'coordinates must be an array of longitude between -180 and 180 and latitude between -90 and 90'
      })
  })
  try {
    const placeIdData = req?.params || {}
    const data = req?.body ? req.body : {}
    await idRule.validateAsync(placeIdData, { abortEarly: false })
    await validationRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const placeValidation = {
  createNew,
  pagingValidate,
  updatePlaceCoordinates
}