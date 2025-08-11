import Blog from '../models/Blog.model.js'
import Place from '../models/Place.model.js'
import slugify from 'slugify'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError.js'
import UserModel from '~/models/User.model.js'


const getBlogs = async (query, user) => {
  const { tag, authorId, status, privacy, page = 1, limit = 10 } = query

  const filter = {}
  if (tag) filter.tags = tag
  if (authorId) filter.authorId = authorId
  if (privacy) filter.privacy = privacy // public/private

  // Chỉ lấy bài chưa bị xóa
  filter.destroy = false


  if (user.role !== 'admin') {
    filter.status = 'approved'
  } else {
    if (status) filter.status = status
  }

  const skip = (page - 1) * limit
  const numericLimit = Number(limit)

  const totalBlogs = await Blog.countDocuments(filter)
  const blogs = await Blog.find(filter)
    .populate('authorId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(numericLimit)
    .lean()

  const totalPages = Math.ceil(totalBlogs / numericLimit)
  const pagination = {
    currentPage: Number(page),
    totalPages,
    totalBlogs
  }

  return { blogs, pagination }
}

const getBlogById = async (id, user) => {
  const blog = await Blog.findById(id)
    .populate('authorId', 'name avatar')
    .lean() // giảm tải bộ nhớ, trả về object thuần

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // Nếu bị hủy → chỉ admin mới xem
  if (blog.destroy && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  // Kiểm tra quyền private
  if (blog.privacy === 'private' &&
    blog.authorId._id.toString() !== user?.id &&
    user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xem bài viết này')
  }

  if (blog.status === 'pending' && user?.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bài viết này chưa được duyệt')
  }

  // Tăng view count (không chờ kết quả để tránh chậm phản hồi)
  Blog.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec()

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

  if (user.role === 'admin') {
    // Đánh dấu để 3 ngày sau xóa
    blog.status = 'deleted'
    blog.deletedAt = new Date()
    await blog.save()

    // Tạo hẹn giờ xóa sau 3 ngày
    setTimeout(async () => {
      const b = await Blog.findById(blogId)
      if (b && b.status === 'deleted') {
        await Blog.findByIdAndDelete(blogId)
        await UserModel.updateMany(
          {},
          { $pull: { sharedBlogs: { blog: blogId } } }
        )
        console.log(`Blog ${blogId} đã bị xóa sau 3 ngày`)
      }
    }, 3 * 24 * 60 * 60 * 1000) // 3 ngày tính bằng mili giây

    return { message: 'Bài viết đã bị đánh dấu xóa, sẽ tự động xóa sau 3 ngày' }
  } else {
    // User xóa → hard delete ngay
    await Blog.findByIdAndDelete(blogId)
    await UserModel.updateMany(
      {},
      { $pull: { sharedBlogs: { blog: blog._id } } }
    )
    return { message: 'Bài viết đã bị xoá khỏi hệ thống' }
  }
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

const updateBlogStatus = async (blogId, newStatus, user) => {
  const blog = await Blog.findById(blogId)

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết')
  }

  if (user.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Chỉ admin mới có quyền chỉnh sửa trạng thái')
  }

  blog.status = newStatus
  await blog.save()
  return blog
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
  getBlogs,
  getBlogById,
  createBlog,
  updateBlogPrivacy,
  deleteBlog,
  likeBlog,
  updateBlogStatus,
  updateBlog,
  shareBlogById
}

