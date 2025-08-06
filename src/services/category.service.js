import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import CategoryModel from '~/models/Category.model.js'

const createNew = async (categoryData) => {
  try {
    const newCategory = await CategoryModel.create({
      ...categoryData
    })
    return newCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const getAllCategories = async () => {
  try {
    const categories = await CategoryModel.find({})
    return categories
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const updateCategory = async (categoryId, updateData) => {
  try {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, updateData, { new: true })
    if (!updatedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    return updatedCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const deleteCategory = async (categoryId) => {
  try {
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId)
    if (!deletedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    return deletedCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const categoryService = {
  createNew,
  getAllCategories,
  updateCategory,
  deleteCategory
}