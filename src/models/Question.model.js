import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 255
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    answers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'answers'
      }
    ],
    views: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      }
    ],
    totalLikes: {
      type: Number,
      default: 0
    },
    totalAnswers: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

const QuestionModel = mongoose.model('questions', questionSchema)
export default QuestionModel
