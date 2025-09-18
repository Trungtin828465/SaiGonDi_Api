import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'questions',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
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

const AnswerModel = mongoose.model('answers', answerSchema)
export default AnswerModel
