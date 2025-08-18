import mongoose from 'mongoose'

const userBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },

    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'badges',
      required: true
    },
    currentPoints: {
      type: Number,
      default: 0
    },
    requiredPoints: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['locked', 'in_progress', 'earned', 'expired'],
      default: 'locked'
    },
    achievedAt: { type: Date }
  },
  { timestamps: true }
)

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })

export default mongoose.model('user_badges', userBadgeSchema)