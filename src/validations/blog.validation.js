import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

const createBlog = async (req, res, next) => {
  const validationRule = Joi.object({
    title: Joi.string().required().min(3).max(255).trim().strict().messages({
      'string.base': 'Tiêu đề phải là một chuỗi',
      'string.empty': 'Tiêu đề không được để trống',
      'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 255 ký tự',
      'any.required': 'Tiêu đề là trường bắt buộc'
    }),
    content: Joi.string().required().min(3).trim().strict().messages({
      'string.base': 'Nội dung phải là một chuỗi',
      'string.empty': 'Nội dung không được để trống',
      'string.min': 'Nội dung phải có ít nhất 3 ký tự',
      'any.required': 'Nội dung là trường bắt buộc'
    }),
    images: Joi.array().items(Joi.string().trim().strict()).optional(),
    tags: Joi.array().items(Joi.string().trim().strict()).optional(),
    privacy: Joi.string().valid('public', 'private').optional()
  })

  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateBlogPrivacy = async (req, res, next) => {
  const validationRule = Joi.object({
    privacy: Joi.string().valid('public', 'private').required().messages({
      'any.only': 'Quyền riêng tư phải là "public" hoặc "private"',
      'any.required': 'Quyền riêng tư là trường bắt buộc'
    })
  })
  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateBlogStatus = async (req, res, next) => {
  const validationRule = Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected').required().messages({
      'any.only': 'Trạng thái phải là một trong "pending", "approved", "rejected"',
      'any.required': 'Trạng thái là trường bắt buộc'
    })
  })
  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const blogValidation = {
  createBlog,
  updateBlogPrivacy,
  updateBlogStatus
}
