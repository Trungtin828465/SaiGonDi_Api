import Blog from '../models/Blog.model.js'
import slugify from 'slugify'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'

const getAllBlogs = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1
  const limit = parseInt(queryParams.limit, 10) || 10
  const startIndex = (page - 1) * limit

  // Chỉ lấy các bài viết công khai và đã được duyệt
  const query = { privacy: 'public', status: 'approved' }

  const blogs = await Blog.find(query)
    .populate('authorId', 'name avatar') 
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)

  const total = await Blog.countDocuments(query)

  return {
    blogs,
    pagination: {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  }
}

const getBlogById = async (blogId, user) => {
  const blog = await Blog.findById(blogId).populate('authorId', 'name avatar')
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // req.user có thể không tồn tại nếu người dùng chưa đăng nhập
  const userId = user?.id
  const userRole = user?.role

  // Nếu bài viết là riêng tư, chỉ tác giả hoặc admin mới được xem
  if (blog.privacy === 'private' && blog.authorId._id.toString() !== userId && userRole !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem bài viết này')
  }

  return blog
}

const createBlog = async (blogData, authorId) => {
  const { title, content, tags, privacy } = blogData

  // Tạo slug và đảm bảo nó là duy nhất
  let baseSlug = slugify(title, { lower: true, strict: true, trim: true })
  let slug = baseSlug
  let count = 1
  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`
  }

  const newBlog = await Blog.create({
    title,
    slug,
    content,
    tags,
    privacy,
    authorId
  })

  return newBlog
}

const updateBlogPrivacy = async (blogId, newPrivacy, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // Chỉ tác giả hoặc admin mới có quyền
  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này')
  }

  blog.privacy = newPrivacy
  await blog.save()

  return blog
}

const deleteBlog = async (blogId, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // Chỉ tác giả hoặc admin mới có quyền xóa
  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này')
  }

  // Hiệu quả hơn vì đã lấy được document
  await blog.deleteOne()
}

const updateBlogStatus = async (blogId, newStatus) => {
  const blog = await Blog.findById(blogId)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // Cập nhật trạng thái và lưu lại
  blog.status = newStatus
  await blog.save()

  return blog
}


export const blogService = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlogPrivacy,
  deleteBlog,
  updateBlogStatus
}