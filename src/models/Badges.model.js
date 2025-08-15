import mongoose from 'mongoose'

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['points', 'special'],
      required: true
    },
    pointsRequired: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    condition: {
      type: Object,
      default: {}
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const BadgeModel = mongoose.model('badges', badgeSchema)

export default BadgeModel
