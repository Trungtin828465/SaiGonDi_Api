import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/category.service.js'

const createNew = async (req, res, next) => {
  try {
    const newCategory = await categoryService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Category created successfully',
      data: newCategory
    })
  } catch (error) {
    next(error)
  }
}

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(req.query)
    res.status(StatusCodes.OK).json({
      message: 'Categories retrieved successfully',
      data: categories
    })
  } catch (error) {
    next(error)
  }
}

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const updatedCategory = await categoryService.updateCategory(categoryId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Category updated successfully',
      data: updatedCategory
    })
  } catch (error) {
    next(error)
  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const deletedCategory = await categoryService.deleteCategory(categoryId)
    res.status(StatusCodes.OK).json({
      message: 'Category deleted successfully',
      data: deletedCategory
    })
  } catch (error) {
    next(error)
  }
}

const getCategoryById = async (req, res, next) => {
  try {
    const categoryId = req.params.id  
    const category = await categoryService.getCategoryById(categoryId)
    res.status(StatusCodes.OK).json({
      message: 'Category retrieved successfully',
      data: category
    })
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  createNew,
  getAllCategories,
  updateCategory,
  getCategoryById,
  deleteCategory
}