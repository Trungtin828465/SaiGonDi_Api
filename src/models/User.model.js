import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { PHONE_RULE, PHONE_RULE_MESSAGE } from '~/utils/validators'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (v) => PHONE_RULE.test(v),
      message: PHONE_RULE_MESSAGE
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'places'
    }],
    required: true,
    default: []
  },
  checkins: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'places'
    }],
    required: true,
    default: []
  },
  points: {
    type: Number,
    default: 0
  },
  badges: {
    type: [{
      type: String,
      enum: ['newbie', 'explorer', 'enthusiast', 'connoisseur', 'expert'],
      default: 'newbie'
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false
  }
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const UserModel = mongoose.model('users', userSchema)

export default UserModel
