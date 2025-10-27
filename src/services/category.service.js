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

const getAllCategories = async (query) => {
  try {
    const filter = { deleted: { $ne: true } }
    if (query && query.type) {
      filter.type = query.type
    }

    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'categories',
          as: 'blogs'
        }
      },
      {
        $lookup: {
          from: 'places',
          localField: '_id',
          foreignField: 'categories',
          as: 'places'
        }
      },
      {
        $addFields: {
          blogCount: { $size: '$blogs' },
          placeCount: { $size: '$places' }
        }
      },
      {
        $project: {
          blogs: 0,
          places: 0
        }
      }
    ]

    const categories = await CategoryModel.aggregate(aggregationPipeline)
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
    const deletedCategory = await CategoryModel.findByIdAndUpdate(categoryId, { deleted: true, deletedAt: new Date() }, { new: true })
    if (!deletedCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    return deletedCategory
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}


const getCategoryById = async (categoryId) => {
  try {
    const category = await CategoryModel.findById(categoryId)
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }

    const aggregationPipeline = [
      {
        $match: {
          _id: category._id
        }
      },
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'categories',
          as: 'blogs'
        }
      },
      {
        $lookup: {
          from: 'places',
          localField: '_id',
          foreignField: 'categories',
          as: 'places'
        }
      },
      {
        $addFields: {
          blogCount: { $size: '$blogs' },
          placeCount: { $size: '$places' }
        }
      }
    ]

    const result = await CategoryModel.aggregate(aggregationPipeline)
    return result[0]
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const categoryService = {
  createNew,
  getAllCategories,
  updateCategory,
  getCategoryById,
  deleteCategory
}