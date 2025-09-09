import Blog from '../models/Blog.model.js'
import Place from '../models/Place.model.js'
import slugify from 'slugify'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import UserModel from '~/models/User.model.js'
import { badgeActionService } from './badgeAction.service.js'

// Lấy danh sách blogs
const getBlogs = async (query, user) => {
  const { tag, category, authorId, status, privacy, page = 1, limit = 10 } = query

  const filter = { destroy: false }

  if (tag) filter.tags = tag
  if (category) filter.categories = category
  if (authorId) filter.authorId = authorId
  if (privacy) filter.privacy = privacy

  // if (user.role !== 'admin') {
  //   filter.status = 'approved'
  // } else {
    if (status) filter.status = status
  // }

  const skip = (page - 1) * limit
  const numericLimit = Number(limit)

  const totalBlogs = await Blog.countDocuments(filter)
  const blogs = await Blog.find(filter)
    .populate('authorId', 'firstName lastName avatar')
    .populate('ward', 'name') 
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(numericLimit)
    .lean()
  
  return {
    blogs,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalBlogs / numericLimit),
      totalBlogs
    }
  }
}

// Lấy chi tiết blog
const getBlogById = async (id, user) => {
  const blog = await Blog.findById(id)
    .populate('authorId', 'firstName lastName avatar')
    .lean()

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // if (blog.destroy && user?.role !== 'admin') {
  //   throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  // }

  if (blog.privacy === 'private' &&
    blog.authorId._id.toString() !== user?.id &&
    user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem bài viết này')
  }

  if (blog.status === 'pending' && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này chưa được duyệt')
  }

  Blog.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec()
  return blog
}

// Lấy chi tiết blog theo slug
const getBlogBySlug = async (slug, user) => {
  const blog = await Blog.findOne({ slug })
    .populate('authorId', 'firstName lastName avatar')
    // .populate("ward", "name")
    .lean()

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }
  if (blog.privacy === 'private' &&
    blog.authorId._id.toString() !== user?.id &&
    user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem bài viết này')
  }

  if (blog.status === 'pending' && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này chưa được duyệt')
  }

  Blog.updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } }).exec()
  return blog
}

// Tạo blog mới
const createBlog = async (blogData, authorId) => {
  const { title, content, album, categories, tags, privacy, locationDetail, ward, province } = blogData

  let baseSlug = slugify(title, { lower: true, strict: true, trim: true })
  let slug = baseSlug
  let count = 1
  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`
  }

  const newBlog = await Blog.create({
    title,
    slug,
    mainImage: blogData.mainImage || (album?.find(m => m.type === 'image')?.url ?? null),
    content,
    album,
    categories,
    tags,
    privacy,
    authorId,
    locationDetail,
    ward,
    province: province || 'Hồ Chí Minh'
  })


  badgeActionService.handleUserAction(authorId, 'create_blog', { blogId: newBlog._id })
  return newBlog
}

// Cập nhật quyền riêng tư
const updateBlogPrivacy = async (blogId, newPrivacy, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')

  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này')
  }

  blog.privacy = newPrivacy
  await blog.save()
  return blog
}

// Xóa blog
const deleteBlog = async (blogId, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')

  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này')
  }

  if (user.role === 'admin') {
    blog.status = 'deleted'
    blog.deletedAt = new Date()
    await blog.save()

    setTimeout(async () => {
      const b = await Blog.findById(blogId)
      if (b && b.status === 'deleted') {
        await Blog.findByIdAndDelete(blogId)
        await UserModel.updateMany({}, { $pull: { sharedBlogs: { blog: blogId } } })
      }
    }, 3 * 24 * 60 * 60 * 1000)

    return { message: 'Bài viết đã bị đánh dấu xóa, sẽ tự động xóa sau 3 ngày' }
  } else {
    await Blog.findByIdAndDelete(blogId)
    await UserModel.updateMany({}, { $pull: { sharedBlogs: { blog: blog._id } } })
    return { message: 'Bài viết đã bị xoá khỏi hệ thống' }
  }
}

// Like / Unlike
const likeBlog = async (blogId, userId) => {
  const blog = await Blog.findById(blogId)
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết.')

  const userIndex = blog.likeBy.findIndex(id => id.toString() === userId.toString())
  if (userIndex === -1) {
    blog.likeBy.push(userId)
    badgeActionService.handleUserAction(userId, 'like', { blogId })
  } else {
    blog.likeBy.splice(userIndex, 1)
  }
  blog.totalLikes = blog.likeBy.length
  await blog.save()
  return blog
}

// Share blog
const shareBlogById = async (blogId, userId) => {
  const blog = await Blog.findById(blogId)
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết.')

  if (blog.privacy !== 'public' || blog.status !== 'approved') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này không thể chia sẻ.')
  }

  blog.shareCount += 1
  await blog.save()

  await UserModel.findByIdAndUpdate(userId, {
    $push: { sharedBlogs: { blog: blogId, sharedAt: new Date() } }
  })

  badgeActionService.handleUserAction(userId, 'share', { blogId })
  return blog
}

// Cập nhật trạng thái
const updateBlogStatus = async (blogId, newStatus, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  if (user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ admin mới có quyền chỉnh sửa trạng thái')
  }
  blog.status = newStatus
  await blog.save()
  return blog
}

// Cập nhật blog
const updateBlog = async (blogId, updateData, user) => {
  const blog = await Blog.findById(blogId)
  if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')

  if (blog.authorId.toString() !== user.id.toString() && user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền sửa bài viết này')
  }

  if (updateData.id_place) {
    const place = await Place.findById(updateData.id_place)
    if (!place) throw new ApiError(StatusCodes.NOT_FOUND, 'Địa điểm không tồn tại')
    if (place.status !== 'approved') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Địa điểm chưa được duyệt')
    }
  }

  const allowedFields = ['title', 'content', 'album', 'mainImage', 'categories', 'tags', 'privacy', 'id_place', 'ward', 'district', 'province']
  Object.keys(updateData).forEach(key => {
    if (allowedFields.includes(key)) {
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

const getBlogsByAuthor = async (authorId, user) => {
  const filter = { authorId, destroy: false }

  if (user.role !== 'admin' && user.id.toString() !== authorId.toString()) {
    filter.privacy = 'public'
    filter.status = 'approved'
  }

  const blogs = await Blog.find(filter)
    .populate('authorId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .lean()

  return blogs
}

export const blogService = {
  getBlogs,
  getBlogById,
  getBlogBySlug,  
  createBlog,
  updateBlogPrivacy,
  getBlogsByAuthor,
  deleteBlog,
  likeBlog,
  updateBlogStatus,
  updateBlog,
  shareBlogById
}
