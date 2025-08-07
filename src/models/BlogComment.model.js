import mongoose from 'mongoose'

const blogCommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    likeBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
      default: []
    }
  },
  {
    timestamps: true
  }
)

const BlogCommentModel = mongoose.model('blog_comments', blogCommentSchema)

export default BlogCommentModel