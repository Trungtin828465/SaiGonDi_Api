import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/user.service.js'

const register = async (req, res, next) => {
  try {
    const newUser = await userService.register(req.body)

    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const user = await userService.login(req.body)

    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers()
    res.status(StatusCodes.OK).json(users)
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id // Assuming user ID is stored in req.user by verifyToken middleware
    const updatedUser = await userService.changePassword(userId, req.body)

    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

const emailOTP = async (req, res, next) => {
  try {
    await userService.emailOTP(req.body)
    res.status(StatusCodes.OK).json({ message: 'OTP sent to email' })
  } catch (error) {
    next(error)
  }
}

const phoneOTP = async (req, res, next) => {
  try {
    await userService.phoneOTP(req.body)
    res.status(StatusCodes.OK).json({ message: 'OTP sent to phone' })
  } catch (error) {
    next(error)
  }
}

const verifyOTP = async (req, res, next) => {
  try {
    await userService.verifyOTP(req.body)
    res.status(StatusCodes.OK).json({ message: 'OTP verified successfully' })
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id // Assuming user ID is stored in req.user by verifyToken middleware
    const profile = await userService.getUserDetails(userId)
    res.status(StatusCodes.OK).json(profile)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  getAllUsers,
  changePassword,
  emailOTP,
  phoneOTP,
  verifyOTP,
  getProfile
}