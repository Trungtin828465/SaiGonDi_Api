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

export const userController = {
  register,
  login
}