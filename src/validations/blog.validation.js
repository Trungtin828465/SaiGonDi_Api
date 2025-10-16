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
    url: Joi.string().uri(),
    caption: Joi.string().allow('').optional()
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
const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const validateQuery = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.query, { abortEarly: false })
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
    categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).max(2).optional().messages({
    'array.max': 'Một bài viết chỉ có thể có tối đa 2 danh mục.'
  }),
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
    categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).max(2).optional().messages({
    'array.max': 'Một bài viết chỉ có thể có tối đa 2 danh mục.'
  }),
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

const validateId = (req, res, next) => {
  const { id } = req.params
  if (!id || Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().validate(id).error) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, 'ID không hợp lệ!'))
  }
  next()
}

const reportBlogSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    'string.base': 'Lý do báo cáo phải là chuỗi.',
    'string.empty': 'Lý do báo cáo không được để trống.',
    'string.min': 'Lý do báo cáo phải có ít nhất {{#limit}} ký tự.',
    'string.max': 'Lý do báo cáo không được vượt quá {{#limit}} ký tự.',
    'any.required': 'Lý do báo cáo là bắt buộc.'
  })
})

const getBlogsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(10),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'title', 'views', 'newest', 'popular'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  query: Joi.string().allow('').optional(),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  author: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: Joi.string().valid('pending', 'approved', 'hidden', 'deleted').optional(),
  privacy: Joi.string().valid('public', 'private', 'friends-only').optional()
})

// Xuất ra middleware
export const blogValidation = {
  getBlogs: validateQuery(getBlogsSchema),
  createBlog: validateBody(createBlogSchema),
  updateBlog: validateBody(updateBlogSchema),
  updateBlogPrivacy: validateBody(updateBlogPrivacySchema),
  updateBlogStatus: validateBody(updateBlogStatusSchema),
  validateBlogId: validateId,
  validateReport: validateBody(reportBlogSchema)
}
