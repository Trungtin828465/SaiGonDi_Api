import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createReviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5).messages({
    'number.base': 'Đánh giá phải là một con số',
    'number.min': 'Đánh giá phải từ 1 đến 5 sao',
    'number.max': 'Đánh giá phải từ 1 đến 5 sao',
    'any.required': 'Đánh giá là trường bắt buộc'
  }),
  comment: Joi.string().required().min(3).trim().messages({
    'string.empty': 'Bình luận không được để trống',
    'string.min': 'Bình luận phải có ít nhất 3 ký tự',
    'any.required': 'Bình luận là trường bắt buộc'
  }),
  images: Joi.array().items(Joi.string()).optional()
})

const deleteReviewSchema = Joi.object({
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

const deleteReview = async (req, res, next) => {
  try {
    await deleteReviewSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const reviewValidation = {
  createReview,
  deleteReview
}