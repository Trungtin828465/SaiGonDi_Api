import { jwtVerify } from '~/utils/jwt'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không có token' })

  try {
    const decoded = jwtVerify(token)
    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

export const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền truy cập'))
  }
  next()
}