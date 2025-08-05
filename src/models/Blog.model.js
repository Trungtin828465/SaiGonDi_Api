import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    privacy: { type: String, enum: ['public', 'private'], default: 'public' },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending' },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      // Phải khớp với tên model đã đăng ký trong User.model.js ('users')
      ref: 'users',
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model('Blog', blogSchema)
