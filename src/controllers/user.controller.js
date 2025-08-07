import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/user.service.js'

const register = async (req, res, next) => {
  try {
    const newUser = await userService.register(req.body)

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        userId: newUser._id,
        email: newUser.email,
        fullName: newUser.firstName + ' ' + newUser.lastName,
      }
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const user = await userService.login({ ...req.body, ipAddress: req.ip, device: req.headers['user-agent'] })

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đăng nhập thành công',
      token: user.token,
      user: {
        userId: user._id,
        role: user.role,
        email: user.email,
        fullName: user.firstName + ' ' + user.lastName
      }
    })
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
    await userService.changePassword(userId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    })
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
    res.status(StatusCodes.OK).json({
      success: true,
      user: profile
    })
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