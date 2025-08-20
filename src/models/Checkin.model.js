import mongoose from 'mongoose'

const checkinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'places',
    required: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  imgList:{
    type: [String],
    default: []
  },
  checkinTime: {
    type: Date,
    default: Date.now
  },
  device: {
    type: String,
    default: 'Unknown Device'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

const Checkin = mongoose.model('Checkin', checkinSchema)

export default Checkin