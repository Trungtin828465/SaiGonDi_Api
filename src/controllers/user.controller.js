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
        fullName: newUser.firstName + ' ' + newUser.lastName
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
    const userId = req?.query?.userId || req.user.id
    const profile = await userService.getUserProfile(userId)
    res.status(StatusCodes.OK).json({
      success: true,
      user: profile
    })
  } catch (error) {
    next(error)
  }
}

const getUserDetails = async (req, res, next) => {
  try {
    const userId = req.params.id
    const userDetails = await userService.getUserDetails(userId)
    res.status(StatusCodes.OK).json({
      success: true,
      user: userDetails
    })
  } catch (error) {
    next(error)
  }
}

const banUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    await userService.banUser(userId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User has been banned successfully'
    })
  } catch (error) {
    next(error)
  }
}

const destroyUser = async (req, res, next) => {
  try {
    const userId = req.params.id
    await userService.destroyUser(userId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User has been deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

const getScoreAndTitle = async (req, res, next) => {
  try {
    const userId = req.user.id
    const scoreData = await userService.getScoreAndTitle(userId)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy điểm và danh hiệu thành công.',
      data: scoreData
    })
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  getAllUsers,
  getUserDetails,
  changePassword,
  emailOTP,
  phoneOTP,
  verifyOTP,
  getProfile,
  banUser,
  destroyUser,
  getScoreAndTitle
}