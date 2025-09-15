import { blogService } from '../services/blog.service.js'
import { StatusCodes } from 'http-status-codes'

/**
 * @desc    Lấy danh sách bài viết công khai (có phân trang)
 * @route   GET /api/blogs
 * @access  Public
 */
const getBlogs = async (req, res, next) => {
  try {
    const { blogs, pagination } = await blogService.getBlogs(req.query, req.user)
    res.status(StatusCodes.OK).json({
      success: true,
      count: blogs.length,
      pagination,
      data: blogs
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Lấy chi tiết một bài viết
 * @route   GET /api/blogs/:id
 * @access  Public (có kiểm tra quyền riêng tư)
 */
const getBlogById = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogById(req.params.id, req.user)
    res.status(StatusCodes.OK).json({
      success: true,
      data: blog
    })
  } catch (error) {
    next(error)
  }
}
// lấy chi tiết một bài viết bằng slug
const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug, req.user)
    res.status(StatusCodes.OK).json(blog)
  } catch (error) {
    next(error)
  }
}

const getBlogsByAuthor = async (req, res, next) => {
  try {
    const blogs = await blogService.getBlogsByAuthor(req.params.authorId, req.user)
    res.status(StatusCodes.OK).json({
      success: true,
      data: blogs
    })
  } catch (error) {
    next(error)
  }
}
/**
 * @desc    Tạo bài viết mới
 * @route   POST /api/blogs
 * @access  Private
 */



const createBlog = async (req, res, next) => {
  try {
    const blogData = {
      ...req.body,
      mainImage: req.cloudFiles?.mainImage,
      album: req.cloudFiles?.album,
      content: [
        ...(req.body.content || []),
        ...(req.cloudFiles?.content || [])
      ]
    };

    // authorId được lấy từ token đã xác thực, không phải từ req.body
    const newBlog = await blogService.createBlog(blogData, req.user.id)
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: newBlog
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Cập nhật chế độ riêng tư
 * @route   PATCH /api/blogs/:id/privacy
 * @access  Private (chỉ tác giả hoặc admin)
 */
const updateBlogPrivacy = async (req, res, next) => {
  try {
    const updatedBlog = await blogService.updateBlogPrivacy(
      req.params.id,
      req.body.privacy,
      req.user
    )
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật quyền riêng tư thành công.',
      data: updatedBlog
    })
  } catch (error) {
    next(error)
  }
}

const updateBlogStatus = async (req, res, next) => {
  try {
    const updatedBlog = await blogService.updateBlogStatus(
      req.params.id,
      req.body.status,
      req.user
    )
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật trạng thái bài viết thành công.',
      data: updatedBlog
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Thích/bỏ thích bài viết
 * @route   PATCH /api/blogs/:id/like
 * @access  Private
 */
const likeBlog = async (req, res, next) => {
  try {
    const updatedBlog = await blogService.likeBlog(
      req.params.id,
      req.user.id
    )
    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedBlog
    })
  } catch (error) {
    next(error)
  }
}

const updateBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id
    const user = req.user

    const updateData = {
      ...req.body,
      mainImage: req.cloudFiles?.mainImage || req.body.mainImage || null,
      album: req.cloudFiles?.album || req.body.album || [],
      content: [
        ...(req.body.content || []),
        ...(req.cloudFiles?.content || [])
      ]
    }

    const updatedBlog = await blogService.updateBlog(blogId, updateData, user)
    res.status(StatusCodes.OK).json({ success: true, data: updatedBlog })
  } catch (error) {
    next(error)
  }
}
/**
 * @desc    Xóa bài viết
 * @route   DELETE /api/blogs/:id
 * @access  Private (chỉ tác giả hoặc admin)
 */
const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlog(req.params.id, req.user)
    res.status(StatusCodes.OK).json({ success: true, message: 'Đã xóa bài viết thành công.' })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Share bài viết
 * @route   PATCH /api/blogs/:id/share
 * @access  Private
 */
const shareBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id
    const userId = req.user.id // đồng bộ với các API khác

    const sharedBlog = await blogService.shareBlogById(blogId, userId)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Chia sẻ bài viết thành công',
      data: sharedBlog
    })
  } catch (error) {
    next(error)
  }
}

const getBlogsByPlaceIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params
    const { blogs, pagination } = await blogService.getBlogsByPlaceIdentifier(identifier, req.query, req.user)
    res.status(StatusCodes.OK).json({
      success: true,
      count: blogs.length,
      pagination,
      data: blogs
    })
  } catch (error) {
    next(error)
  }
}

const getBlogsByWard = async (req, res, next) => {
  try {
    const { wardId } = req.params
    const { blogs, pagination } = await blogService.getBlogsByWard(wardId, req.query, req.user)
    res.status(StatusCodes.OK).json({
      success: true,
      count: blogs.length,
      pagination,
      data: blogs
    })
  } catch (error) {
    next(error)
  }
}


export const blogController = {
  getBlogs,
  getBlogById,
  getBlogBySlug, 
  createBlog,
  updateBlogPrivacy,
  updateBlogStatus,
  deleteBlog,
  likeBlog,
  updateBlog,
  getBlogsByAuthor,
  shareBlog,
  getBlogsByPlaceIdentifier,
  getBlogsByWard
}