import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  otp: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5m' // OTP expires in 5 minutes
  }
})

const OTPModel = mongoose.model('otps', otpSchema)

export default OTPModel
