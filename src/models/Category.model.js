import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  icon: {
    type: String,
    required: false,
    trim: true,
    minlength: 3,
    maxlength: 100,
    default: null
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500,
    default: ''
  },
  type: {
    type: String,
    enum: ['place', 'blog'],
    required: true,
    default: 'place'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false
  }
})

const CategoryModel = mongoose.model('categories', categorySchema)

export default CategoryModel
