import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    // Tiêu đề bài viết
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255
    },

    // Slug để SEO
    slug: {
      type: String,
      required: true,
      unique: true
    },

    // Ảnh chính (thumbnail)
    mainImage: {
      type: String,
      default: null
    },

    // Nội dung chính: có thể là text, image, video
    content: [
      {
        type: {
          type: String,
          enum: ['text', 'image', 'video'],
          required: true
        },
        value: {
          type: String,
          required: function () {
            return this.type === 'text'
          }
        },
        url: {
          type: String,
          required: function () {
            return ['image', 'video'].includes(this.type)
          }
        }
      }
    ],

    // Album (ảnh và video)
    album: [
      {
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true
        },
        url: {
          type: String, // link sau khi upload (Cloudinary/S3/local storage)
          required: true
        },
        caption: {
          type: String, // mô tả do user nhập
          default: null
        }
      }
    ],

    // Categories: phân loại (du lịch, ẩm thực, review…)
    categories: {
      type: [String],
      default: []
    },

    // Tags (hash tag)
    tags: {
      type: [String],
      default: []
    },

    // Cài đặt quyền riêng tư
    privacy: {
      type: String,
      enum: ['public', 'private', 'friends-only', 'pending'],
      default: 'public'
    },

    // Like & tương tác
    totalLikes: { type: Number, default: 0 },
    likeBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    shareCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    // Tác giả
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },

    // Địa điểm chi tiết do user nhập (tự do)
    locationDetail: {
      type: String,
      default: null
    },

    // Lưu phường xã + tỉnh/thành
    ward: {
      type: String,
      default: null
    },
    province: {
      type: String,
      default: 'Hồ Chí Minh'
    },

    // Nếu là bài share/repost
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
      default: null
    },

    // Trạng thái
    status: {
      type: String,
      enum: ['pending', 'approved', 'hidden', 'deleted'],
      default: 'pending'
    },
    destroy: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
)

blogSchema.index({ createdAt: 1 })
blogSchema.index({ tags: 1 })
blogSchema.index({ categories: 1 })

const BlogModel = mongoose.model('blogs', blogSchema)
export default BlogModel
