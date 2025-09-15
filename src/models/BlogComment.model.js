import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true })

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
    },
    reports: {
      type: [reportSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)

const BlogCommentModel = mongoose.model('blog_comments', blogCommentSchema)

export default BlogCommentModel