import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createNew = async (req, res, next) => {
  const validationRule = Joi.object({
    title: Joi.string().min(10).max(255).required().messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 10 characters long',
      'string.max': 'Title cannot exceed 255 characters'
    })
  })
  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const getQuestions = async (req, res, next) => {
  const pagingRule = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'views', 'totalLikes', 'totalAnswers').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
  try {
    await pagingRule.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateQuestion = async (req, res, next) => {
  const validationRule = Joi.object({
    title: Joi.string().min(10).max(255).messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 10 characters long',
      'string.max': 'Title cannot exceed 255 characters'
    })
  })
  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const addAnswer = async (req, res, next) => {
  const validationRule = Joi.object({
    content: Joi.string().min(5).max(1000).required().messages({
      'string.base': 'Content must be a string',
      'string.empty': 'Content cannot be empty',
      'string.min': 'Content must be at least 5 characters long',
      'string.max': 'Content cannot exceed 1000 characters'
    })
  })
  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateAnswer = async (req, res, next) => {
  const validationRule = Joi.object({
    content: Joi.string().min(5).max(1000).messages({
      'string.base': 'Content must be a string',
      'string.empty': 'Content cannot be empty',
      'string.min': 'Content must be at least 5 characters long',
      'string.max': 'Content cannot exceed 1000 characters'
    })
  })
  try {
    await validationRule.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const questionValidation = {
  createNew,
  getQuestions,
  updateQuestion,
  addAnswer,
  updateAnswer
}
