import mongoose from 'mongoose'

const searchLogSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // Automatically delete logs after 30 days
  }
})

searchLogSchema.index({ keyword: 1 })
searchLogSchema.index({ createdAt: 1 })


const SearchLogModel = mongoose.model('SearchLog', searchLogSchema)

export default SearchLogModel
