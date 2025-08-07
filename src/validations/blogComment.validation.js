import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createComment = async (req, res, next) => {
  const validationRule = Joi.object({
    comment: Joi.string().required().trim().messages({
      'string.empty': 'comment không được để trống.',
      'any.required': 'comment là trường bắt buộc.'
    }),
    images: Joi.array().items(Joi.string().uri()).optional()
  })

  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateComment = async (req, res, next) => {
  const validationRule = Joi.object({
    comment: Joi.string().trim().messages({
      'string.empty': 'Nội dung bình luận không được để trống.'
    }),
    images: Joi.array().items(Joi.string().uri()).optional()
  }).min(1).messages({
    'object.min': 'Phải cung cấp ít nhất một trường để cập nhật.'
  })

  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const validateCommentId = async (req, res, next) => {
  const validationRule = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  try {
    await validationRule.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const validateBlogId = async (req, res, next) => {
  const validationRule = Joi.object({
    blogId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  try {
    await validationRule.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const blogCommentValidation = {
  createComment,
  updateComment,
  validateCommentId,
  validateBlogId
}