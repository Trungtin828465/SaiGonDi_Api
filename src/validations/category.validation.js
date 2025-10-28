import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
const createNew = async (req, res, next) => {
  const validationRule = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.base': 'name must be a string',
      'string.empty': 'name cannot be empty',
      'string.min': 'name must be at least 3 characters long'
    }),
    type: Joi.string().valid('place', 'blog').default('place').optional(),
    description: Joi.string().max(500).optional().allow('').messages({
      'string.base': 'description must be a string'
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

export const categoryValidation = {
  createNew
}