import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const register = async (req, res, next) => {
  const validationRule = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must not exceed 30 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long'
    }),
    avatar: Joi.string().uri().optional().default(''),
    bio: Joi.string().max(200).optional().default(''),
    role: Joi.string().valid('user', 'admin').optional().default('user'),
    favorites: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    checkins: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
    points: Joi.number().integer().min(0).optional().default(0),
    badges: Joi.array().items(Joi.string()).optional().default([]),
    createdAt: Joi.date().default(Date.now())
  })

  try {
    const data = req?.body ? req.body : {}
    await validationRule.validateAsync(data, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const validationRule = Joi.object({
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long'
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

export const userValidation = {
  register,
  login
}