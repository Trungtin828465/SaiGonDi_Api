import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createReviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5).messages({
    'number.base': ' phải là một con số',
    'number.min': 'rating phải từ 1 đến 5 sao',
    'number.max': 'rating phải từ 1 đến 5 sao',
    'any.required': 'rating là trường bắt buộc'
  }),
  comment: Joi.string().required().min(3).trim().messages({
    'string.empty': 'comment không được để trống',
    'string.min': 'comment phải có ít nhất 3 ký tự',
    'any.required': 'comment là trường bắt buộc'
  }),
  images: Joi.array().items(Joi.string()).optional()
})

const reviewIdSchema = Joi.object({
  reviewId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
})

const createReview = async (req, res, next) => {
  try {
    await createReviewSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const validateReviewId = async (req, res, next) => {
  try {
    await reviewIdSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const reviewValidation = {
  createReview,
  validateReviewId
}