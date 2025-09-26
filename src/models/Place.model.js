import { required } from 'joi'
import mongoose, { mongo } from 'mongoose'
import slugify from 'slugify'

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'categories',
    default: []
  },
  services: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'services',
    default: []
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  ward: { //đổi lại để ward 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wards',
    required: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: false
    },
    coordinates: {
      type: [Number],
      default: []
    }
  },
  images: {
    type: [{
      type: String,
      required: true
    }],
    default: []
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Place',
    default: [],
  },
  totalRatings: {
    type: Number,
    default: 0
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'hidden'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    default: null
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

// Function to generate slug from name using slugify package
function generateSlug(name) {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'vi', // Vietnamese locale support
    remove: /[*+~.()'"!:@]/g // Remove special characters
  })
}

// Pre-save middleware to generate slug
placeSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = generateSlug(this.name)
    let slug = baseSlug
    let counter = 1

    // Check if slug already exists and make it unique
    while (await mongoose.model('places').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    this.slug = slug
  }
  next()
})

placeSchema.index({ location: '2dsphere' })

placeSchema.methods.updateTotalLikes = async function () {
  this.totalLikes = this.likeBy.length
  await this.save()
}

const PlaceModel = mongoose.model('places', placeSchema)

export default PlaceModel
