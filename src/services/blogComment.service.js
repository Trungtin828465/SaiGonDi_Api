import BlogCommentModel from '~/models/BlogComment.model.js'
import BlogModel from '~/models/Blog.model.js'
import ApiError from '~/utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import { badgeActionService } from './badgeAction.service.js'

const createComment = async (blogId, commentData, userId) => {
  const blog = await BlogModel.findById(blogId)
  if (!blog || blog.privacy !== 'public' || blog.status !== 'approved') {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài viết hoặc bài viết không công khai.')
  }

  // 2. Tạo bình luận mới
  const newComment = await BlogCommentModel.create({
    ...commentData,
    blogId: blogId,
    userId: userId
  })

  // Trigger badge action
  badgeActionService.handleUserAction(userId, 'comment', { blogId, commentId: newComment._id })

  return newComment
}

const getCommentsByBlog = async (blogId, queryParams) => {
  const page = parseInt(queryParams.page, 10) || 1
  const limit = parseInt(queryParams.limit, 10) || 10
  const startIndex = (page - 1) * limit

  const query = { blogId }

  const comments = await BlogCommentModel.find(query)
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)

  const total = await BlogCommentModel.countDocuments(query)

  return {
    comments,
    pagination: {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  }
}

const updateComment = async (commentId, userId, updateData) => {
  const comment = await BlogCommentModel.findById(commentId)
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bình luận.')

  if (comment.userId.toString() !== userId.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền sửa bình luận này.')
  }

  comment.comment = updateData.comment ?? comment.comment
  comment.images = updateData.images ?? comment.images

  await comment.save()
  return comment
}

const deleteComment = async (commentId, user) => {
  const comment = await BlogCommentModel.findById(commentId)

  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bình luận.')
  }

  const isAuthor = comment.userId.toString() === user.id.toString()
  const isAdmin = user.role === 'admin'

  if (!isAuthor && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xoá bình luận này.')
  }

  await comment.deleteOne()
}


const likeComment = async (commentId, userId) => {
  const comment = await BlogCommentModel.findById(commentId)
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bình luận.')

  const userIndex = comment.likeBy.findIndex((id) => id.toString() === userId.toString())

  if (userIndex === -1) {
    comment.likeBy.push(userId)
    // Trigger badge action
    badgeActionService.handleUserAction(userId, 'like_comment', { commentId })
  } else {
    comment.likeBy.splice(userIndex, 1)
  }

  comment.totalLikes = comment.likeBy.length
  await comment.save()
  return comment
}

export const blogCommentService = {
  createComment,
  getCommentsByBlog,
  updateComment,
  deleteComment,
  likeComment
}