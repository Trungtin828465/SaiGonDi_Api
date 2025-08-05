import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { jwtGenerate } from '~/utils/jwt'
import UserModel from '~/models/User.model.js'
import OTPModel from '~/models/OTP.model.js'
import sendMail from '~/utils/sendMail.js'
import sendSMS from '~/utils/sendSMS.js'

const generateAndSaveOTP = async ({ email = '', phone = '' }) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  console.log({ email, phone, otp }) // Debugging line to check OTP generation
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

    const returnUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      bio: newUser.bio,
      role: newUser.role,
      favorites: newUser.favorites,
      checkins: newUser.checkins,
      points: newUser.points,
      badges: newUser.badges,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }
    return returnUser
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

    const returnUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      favorites: user.favorites,
      checkins: user.checkins,
      points: user.points,
      badges: user.badges,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    const token = jwtGenerate({ id: user._id, email: user.email, role: user.role })

    return { user: { ...returnUser }, token }
  } catch (error) {
    throw error
  }
}

const getAllUsers = async () => {
  try {
    const users = await UserModel.find({})
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
    await user.save()
    return { message: 'Password changed successfully' }
  } catch (error) {
    throw error
  }
}

const emailOTP = async (email) => {
  try {
    const otp = await generateAndSaveOTP(email)
    // Here you would typically save the OTP to the database or cache with an expiration time
    // For simplicity, we are just returning it
    // await saveOtpToDatabase(email, otp) // Implement this function to save OTP securely
    // Send the OTP to the user's email
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

    // Optionally, you can delete the OTP record after successful verification
    await OTPModel.deleteOne({ _id: otpRecord._id })

    return { message: 'OTP verified successfully' }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to verify OTP')
  }
}

const getProfile = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    const { password, ...profile } = user.toObject()
    return profile
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
  getProfile
}