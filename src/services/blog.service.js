import Blog from '../models/Blog.model.js'
import Place from '../models/Place.model.js'
import slugify from 'slugify'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import UserModel from '~/models/User.model.js'


const getAppovedBlogs = async (queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1
  const limit = parseInt(queryParams.limit, 10) || 10
  const startIndex = (page - 1) * limit

  // Chỉ lấy các bài viết công khai, đã được duyệt và chưa bị hủy
  const query = { privacy: 'public', status: 'approved', destroy: false }

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

  // Nếu bài viết đã bị hủy, chỉ admin mới được xem
  if (blog.destroy && user?.role !== 'admin') {
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
  const { title, content, tags, privacy, images, id_place } = blogData

  // Nếu có id_place, kiểm tra xem địa điểm có tồn tại và đã được duyệt chưa
  if (id_place) {
    const place = await Place.findById(id_place)
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Địa điểm không tồn tại')
    }
    if (place.status !== 'approved') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Địa điểm chưa được duyệt')
    }
  }

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
    images,
    authorId,
    id_place
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

  // Soft delete
  blog.destroy = true
  await blog.save()

  // Xoá blog khỏi sharedBlogs của tất cả user
  await UserModel.updateMany(
    {},
    { $pull: { sharedBlogs: { blog: blog._id } } }
  )

  return { message: 'Bài viết đã bị xoá và xoá khỏi danh sách chia sẻ của user' }
}

const likeBlog = async (blogId, userId) => {
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết.')
  }

  const userIndex = blog.likeBy.findIndex((id) => id.toString() === userId.toString())

  if (userIndex === -1) {
    blog.likeBy.push(userId)
  } else {
    blog.likeBy.splice(userIndex, 1)
  }
  blog.totalLikes = blog.likeBy.length

  await blog.save()
  return blog
}

const shareBlogById = async (blogId, userId) => {
  const blog = await Blog.findById(blogId)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết.')
  }

  // Chỉ cho phép chia sẻ nếu bài viết công khai và đã được duyệt
  if (blog.privacy !== 'public' || blog.status !== 'approved') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này không thể chia sẻ.')
  }

  blog.shareCount += 1
  await blog.save()

  // Cập nhật sharedBlogs của user
  await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        sharedBlogs: {
          blog: blogId,
          sharedAt: new Date()
        }
      }
    },
    { new: true }
  )

  return blog
}

const updateBlogStatus = async (blogId, newStatus) => {
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // Cập nhật trạng thái và lưu lại
  blog.status = newStatus
  await blog.save()
}

const updateBlog = async (blogId, updateData, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền sửa bài viết này')
  }

  // Nếu có id_place, kiểm tra xem địa điểm có tồn tại và đã được duyệt chưa
  if (updateData.id_place) {
    const place = await Place.findById(updateData.id_place)
    if (!place) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Địa điểm không tồn tại')
    }
    if (place.status !== 'approved') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Địa điểm chưa được duyệt')
    }
  }

  // Chỉ cho phép cập nhật các trường được chỉ định
  Object.keys(updateData).forEach((key) => {
    if (['title', 'content', 'tags', 'privacy', 'images', 'id_place'].includes(key)) {
      blog[key] = updateData[key]
    }
  })

  if (updateData.title) {
    let baseSlug = slugify(updateData.title, { lower: true, strict: true, trim: true })
    let slug = baseSlug
    let count = 1
    while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
      slug = `${baseSlug}-${count++}`
    }
    blog.slug = slug
  }

  await blog.save()
  return blog
}

export const blogService = {
  getAppovedBlogs,
  getBlogById,
  createBlog,
  updateBlogPrivacy,
  deleteBlog,
  likeBlog,
  updateBlogStatus,
  updateBlog,
  shareBlogById
}

