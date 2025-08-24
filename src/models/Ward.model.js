import mongoose from 'mongoose'

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['phường', 'xã', 'đặc khu'], required: true }
})

export default mongoose.model('wards', wardSchema)