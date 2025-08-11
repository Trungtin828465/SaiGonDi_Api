import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    content: [
      {
        type: {
          type: String,
          enum: ['text', 'image'],
          required: true
        },
        value: {
          type: String,
          required: true
        }
      }
    ],
    images: {
      type: [String],
      default: []
    },
    privacy: {
      type: String,
      enum: ['public', 'private', 'friends-only', 'pending'],
      default: 'public'
    },
    tags: {
      type: [String],
      default: []
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    likeBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'hidden'],
      default: 'pending'
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    id_place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'places',
      default: null
    },
    shareCount: {
      type: Number,
      default: 0
    },
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
      default: null
    },
    destroy : {
      type: Boolean,
      default: false
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

blogSchema.index({ slug: 1 })
blogSchema.index({ createdAt: 1 })
blogSchema.index({ tags: 1 })

const BlogModel = mongoose.model('blogs', blogSchema)

export default BlogModel