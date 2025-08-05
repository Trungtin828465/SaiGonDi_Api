import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { jwtGenerate } from '~/utils/jwt'
import UserModel from '~/models/User.model.js'

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

export const userService = {
  register,
  login,
  getAllUsers
}