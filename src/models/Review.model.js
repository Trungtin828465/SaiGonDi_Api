import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'places',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
)

// Hàm static để tính toán và cập nhật rating trung bình cho một địa điểm
reviewSchema.statics.calculateAverageRating = async function (placeId) {
  const stats = await this.aggregate([
    {
      $match: { placeId: placeId }
    },
    {
      $group: {
        _id: '$placeId',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])

  try {
    // Cần import PlaceModel ở đầu file
    // import PlaceModel from './Place.model.js'
    if (stats.length > 0) {
      await mongoose.model('Place').findByIdAndUpdate(placeId, {
        averageRating: stats[0].avgRating,
        numReviews: stats[0].numRatings
      })
    } else {
      // Nếu không còn review nào, reset rating
      await mongoose.model('Place').findByIdAndUpdate(placeId, {
        averageRating: 0,
        numReviews: 0
      })
    }
  } catch (err) {
    console.error(err)
  }
}

// Gọi hàm calculateAverageRating sau khi một review được lưu (tạo mới hoặc cập nhật)
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.placeId)
})

// Gọi hàm calculateAverageRating trước khi một review bị xóa
reviewSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  // Lưu lại placeId để có thể sử dụng trong 'post' hook
  this.placeIdForUpdate = this.placeId
  next()
})

reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calculateAverageRating(this.placeIdForUpdate)
})

const ReviewModel = mongoose.model('Review', reviewSchema)

export default ReviewModel