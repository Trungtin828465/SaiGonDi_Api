import jwt from 'jsonwebtoken'
import { env } from '~/config/environment.js'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'

const jwtGenerate = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '1h'
  })
}

const jwtVerify = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET)
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ')
  }
}

export { jwtGenerate, jwtVerify }