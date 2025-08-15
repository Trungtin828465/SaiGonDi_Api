import mongoose from 'mongoose'

const PointHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'badges'
  },
  action: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  meta: { type: Object },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('point_histories', PointHistorySchema)
