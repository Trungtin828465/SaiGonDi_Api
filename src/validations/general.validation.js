import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const paramIdValidate = async (req, res, next) => {
  const idRule = Joi.object({
    id: Joi.string().pattern(OBJECT_ID_RULE).required().messages({
      'string.base': 'ID must be a string',
      'string.pattern.base': OBJECT_ID_RULE_MESSAGE
    })
  })
  try {
    const data = req?.params ? req.params : {}
    await idRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const queryUserIdValidate = async (req, res, next) => {
  const queryRule = Joi.object({
    userId: Joi.string().pattern(OBJECT_ID_RULE).required().messages({
      'string.base': 'User ID must be a string',
      'string.pattern.base': OBJECT_ID_RULE_MESSAGE
    })
  })
  try {
    const data = req?.query ? req.query : {}
    await queryRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const generalValidation = {
  paramIdValidate,
  queryUserIdValidate
}
