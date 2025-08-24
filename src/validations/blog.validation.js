import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

// Schema con cho album
const albumSchema = Joi.array().items(
  Joi.object({
    type: Joi.string().valid('image', 'video').required().messages({
      'any.only': 'Album chỉ chấp nhận "image" hoặc "video"',
      'any.required': 'Trường type trong album là bắt buộc'
    }),
    url: Joi.string().uri().required().messages({
      'string.uri': 'URL album phải hợp lệ',
      'any.required': 'URL là bắt buộc'
    }),
    caption: Joi.string().allow('').optional()
  })
)

// Schema con cho content
const contentSchema = Joi.array().items(
  Joi.object({
    type: Joi.string().valid('text', 'image', 'video').required().messages({
      'any.only': 'Nội dung chỉ được là "text", "image" hoặc "video"',
      'any.required': 'Loại nội dung là bắt buộc'
    }),
    value: Joi.string(),
    url: Joi.string().uri()
  }).when(Joi.object({ type: 'text' }).unknown(), {
    then: Joi.object({
      value: Joi.required().messages({
        'any.required': 'Giá trị nội dung là trường bắt buộc cho type "text".'
      }),
      url: Joi.forbidden()
    })
  }).when(Joi.object({ type: Joi.valid('image', 'video') }).unknown(), {
    then: Joi.object({
      url: Joi.required().messages({
        'any.required': 'URL là trường bắt buộc cho type "image" hoặc "video".'
      }),
      value: Joi.forbidden()
    })
  })
).min(1).required().messages({
  'array.base': 'Nội dung phải là một mảng',
  'array.min': 'Nội dung phải có ít nhất một khối'
})

// Helper validate chung
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

// Schema cho từng use case
const createBlogSchema = Joi.object({
  title: Joi.string().min(3).max(255).trim().required().messages({
    'string.base': 'Tiêu đề phải là chuỗi',
    'string.empty': 'Tiêu đề không được để trống',
    'any.required': 'Tiêu đề là bắt buộc'
  }),
  slug: Joi.string().optional(),
  mainImage: Joi.string().uri().allow(null).optional(),
  content: contentSchema,
  album: albumSchema.optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  privacy: Joi.string().valid('public', 'private', 'friends-only', 'pending').optional(),
  locationDetail: Joi.string().allow('').optional(),
  ward: Joi.string().allow('').optional(),
  province: Joi.string().allow('').optional()
})

const updateBlogSchema = Joi.object({
  title: Joi.string().min(3).max(255).trim().optional(),
  slug: Joi.string().optional(),
  mainImage: Joi.string().uri().allow(null).optional(),
  content: contentSchema.optional(),
  album: albumSchema.optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  privacy: Joi.string().valid('public', 'private', 'friends-only', 'pending').optional(),
  locationDetail: Joi.string().allow('').optional(),
  ward: Joi.string().allow('').optional(),
  province: Joi.string().allow('').optional(),
  status: Joi.string().valid('pending', 'approved', 'hidden', 'deleted').optional()
})

const updateBlogPrivacySchema = Joi.object({
  privacy: Joi.string().valid('public', 'private', 'friends-only').required()
})

const updateBlogStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'hidden', 'deleted').required()
})

// Xuất ra middleware
export const blogValidation = {
  createBlog: validate(createBlogSchema),
  updateBlog: validate(updateBlogSchema),
  updateBlogPrivacy: validate(updateBlogPrivacySchema),
  updateBlogStatus: validate(updateBlogStatusSchema)
}
