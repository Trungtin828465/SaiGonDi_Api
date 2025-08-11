import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { jwtGenerate } from '~/utils/jwt'
import UserModel from '~/models/User.model.js'
import OTPModel from '~/models/OTP.model.js'
import sendMail from '~/utils/sendMail.js'
import sendSMS from '~/utils/sendSMS.js'

const generateAndSaveOTP = async ({ email = '', phone = '' }) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpData = {
    email,
    phone,
    otp
  }
  // Save OTP to the database (you need to implement this function)
  await OTPModel.create(otpData)
  return otp
}

const register = async (registerData) => {
  try {
    const existingUser = await UserModel.findOne({ email: registerData.email })

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email is already exists')
    }

    const newUser = await UserModel.create(registerData)

    return newUser
  } catch (error) { throw error }
}

const login = async (loginData) => {
  try {
    const user = await UserModel.findOne({ email: loginData.email })
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
    }
    const isPasswordValid = await user.comparePassword(loginData.password)
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned')
    }

    const token = jwtGenerate({ id: user._id, email: user.email, role: user.role })
    await user.saveLog(loginData.ipAddress, loginData.device)
    return { ...user.toObject(), token }
  } catch (error) {
    throw error
  }
}

const getAllUsers = async () => {
  try {
    const users = await UserModel.find({ role: 'user' }).select('-password')
    return users
  } catch (error) {
    throw error
  }
}

const changePassword = async (userId, passwordData) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    const isCurrentPasswordValid = await user.comparePassword(passwordData.currentPassword)
    if (!isCurrentPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect')
    }
    user.password = passwordData.newPassword
    user.updatedAt = Date.now() // Update the updatedAt field
    await user.save()
    return { message: 'Password changed successfully' }
  } catch (error) {
    throw error
  }
}

const emailOTP = async (emailData) => {
  try {
    const { email, purpose } = emailData
    if (purpose === 'forgot_password') {
      const user = await UserModel.findOne({ email })
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
      }
    }
    const otp = await generateAndSaveOTP({ email })
    await sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`)
    return otp
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to sent send OTP email')
  }
}

const phoneOTP = async (phoneData) => {
  try {
    const otp = await generateAndSaveOTP({ phone: phoneData.phone })

    await sendSMS(phoneData.phone, `Your OTP code is ${otp}`)
    return otp
  } catch (error) {
    throw error
  }
}

const verifyOTP = async (otpData) => {
  try {
    const otpRecord = await OTPModel.findOne(otpData)

    if (!otpRecord) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid OTP')
    }
    await otpRecord.setVerified()
    // Optionally, you can delete the OTP record after successful verification
    await OTPModel.deleteOne({ _id: otpRecord._id })

    return { message: 'OTP verified successfully' }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to verify OTP')
  }
}


// Aggregate user details after implementing other modals (Places, Checkins, etc.)
const getUserProfile = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'user' || user._destroyed) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'This account has been banned')
    }
    const profile = {
      userId: user._id,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified
    }
    return profile
  } catch (error) {
    throw error
  }
}

const getUserDetails = async (userId) => {
  try {
    const user = await UserModel.find({ _id: userId, role: 'user' })
      .populate('favorites', 'name address avgRating totalRatings')
      .populate('checkins', 'name address avgRating totalRatings')
      .populate('badges', 'name address avgRating totalRatings')
      .populate('sharedBlogs', 'title content')
      .select('-password -__v')
    if (!user ||user.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    return user[0]
  } catch (error) {
    throw error
  }
}

const banUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'user') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already banned')
    }
    user.banned = true
    await user.save()
  } catch (error) {
    throw error
  }
}

const destroyUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'user') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    user._destroyed = true
    await user.save()
  } catch (error) {
    throw error
  }
}

export const userService = {
  register,
  login,
  getAllUsers,
  changePassword,
  emailOTP,
  verifyOTP,
  phoneOTP,
  getUserDetails,
  getUserProfile,
  banUser,
  destroyUser
}