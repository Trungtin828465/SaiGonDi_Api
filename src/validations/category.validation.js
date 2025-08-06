import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createNew = async (req, res, next) => {
  const validationRule = Joi.object({
    name: Joi.string().min(3).required().messages({
      'string.base': 'name must be a string',
      'string.empty': 'name cannot be empty',
      'string.min': 'name must be at least 3 characters long'
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

const idValidate = async (req, res, next) => {
  const validationRule = Joi.object({
    id: Joi.string().pattern(OBJECT_ID_RULE).required().messages({
      'string.base': 'ID must be a string',
      'string.pattern.base': OBJECT_ID_RULE_MESSAGE
    })
  })
  try {
    const data = req?.params ? req.params : {}
    await validationRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const categoryValidation = {
  createNew,
  idValidate
}