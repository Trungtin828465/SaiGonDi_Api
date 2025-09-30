import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
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

const ServiceModel = mongoose.model('services', serviceSchema)

export default ServiceModel
