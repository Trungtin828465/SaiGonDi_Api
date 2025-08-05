import mongoose from 'mongoose'

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['restaurant', 'cafe', 'park', 'museum', 'shopping', 'other']
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  district: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  ward: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  images: {
    type: [{
      type: String,
      required: true
    }],
    default: []
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'hidden'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
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

const PlaceModel = mongoose.model('places', placeSchema)

export default PlaceModel
