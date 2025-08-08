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
    content: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('text', 'image').required().messages({
          'string.base': 'Loại nội dung phải là chuỗi',
          'any.only': 'Loại nội dung phải là "text" hoặc "image"',
          'any.required': 'Loại nội dung là trường bắt buộc'
        }),
        value: Joi.string().required().messages({
          'string.base': 'Giá trị nội dung phải là chuỗi',
          'string.empty': 'Giá trị nội dung không được để trống',
          'any.required': 'Giá trị nội dung là trường bắt buộc'
        })
      })
    ).min(1).required().messages({
      'array.base': 'Nội dung phải là một mảng các khối',
      'array.min': 'Nội dung phải có ít nhất một khối',
      'any.required': 'Nội dung là trường bắt buộc'
    }),
    tags: Joi.array().items(Joi.string().trim().strict()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
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
    status: Joi.string().valid('pending', 'approved', 'hidden').required().messages({
      'any.only': 'Trạng thái phải là một trong "pending", "approved", "hidden"',
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

const updateBlog = async (req, res, next) => {
  const validationRule = Joi.object({
    title: Joi.string().min(3).max(255).trim().strict().optional().messages({
      'string.base': 'Tiêu đề phải là một chuỗi',
      'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 255 ký tự'
    }),
    content: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('text', 'image').required().messages({
          'string.base': 'Loại nội dung phải là chuỗi',
          'any.only': 'Loại nội dung phải là "text" hoặc "image"',
          'any.required': 'Loại nội dung là trường bắt buộc'
        }),
        value: Joi.string().required().messages({
          'string.base': 'Giá trị nội dung phải là chuỗi',
          'string.empty': 'Giá trị nội dung không được để trống',
          'any.required': 'Giá trị nội dung là trường bắt buộc'
        })
      })
    ).min(1).optional().messages({
      'array.base': 'Nội dung phải là một mảng các khối',
      'array.min': 'Nội dung phải có ít nhất một khối'
    }),
    tags: Joi.array().items(Joi.string().trim().strict()).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    privacy: Joi.string().valid('public', 'private').optional()
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
  updateBlogStatus,
  updateBlog
}
