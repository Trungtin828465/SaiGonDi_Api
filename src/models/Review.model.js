import mongoose from 'mongoose'
import PlaceModel from '~/models/Place.model.js'

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
    totalLikes: {
      type: Number,
      default: 0
    },
    likeBy: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      }],
      default: []
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


reviewSchema.methods.updatePlaceAvgRating = async function () {
  const place = await PlaceModel.findById(this.placeId)
  if (place) {
    const reviews = await ReviewModel.find({ placeId: this.placeId })
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    place.avgRating = avgRating || 0
    await place.save()
  }
}

const ReviewModel = mongoose.model('reviews', reviewSchema)

export default ReviewModel
