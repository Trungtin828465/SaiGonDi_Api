import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { jwtGenerate, requestNewToken } from '~/utils/jwt'
import UserModel from '~/models/User.model.js'
import OTPModel from '~/models/OTP.model.js'
import ReviewModel from '~/models/Review.model.js'
import CheckinModel from '~/models/Checkin.model.js'
import RefreshTokenModel from '~/models/RefreshToken.model'
import { userBadgeService } from '~/services/userBadge.service.js'
import sendMail from '~/utils/sendMail.js'
import BlogModel from '~/models/Blog.model.js'

const generateAndSaveOTP = async (email) => {
  if (!email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is required to generate OTP')
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpData = {
    email,
    otp
  }
  await OTPModel.create(otpData)
  return otp
}

const sendRegistrationOtp = async (reqBody) => {
  try {
    const { email } = reqBody
    const existingUser = await UserModel.findOne({ email: email })

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email is already exists')
    }

    const otp = await generateAndSaveOTP(email)
    await sendMail(email, 'Your OTP Code for registration', `Your OTP code is ${otp}`)
    return otp
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to sent send OTP email')
  }
}

const register = async (registerData) => {
  try {
    const { email, otp } = registerData
    const otpRecord = await OTPModel.findOne({ email, otp })

    if (!otpRecord) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid OTP')
    }

    const existingUser = await UserModel.findOne({ email: registerData.email })

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email is already exists')
    }

    const newUser = await UserModel.create(registerData)
    await OTPModel.deleteOne({ _id: otpRecord._id })

    return newUser
  } catch (error) { throw error }
}

const login = async (loginData) => {
  try {
    const user = await UserModel.findOne({ email: loginData.email })
      .select('_id role email firstName lastName password banned')
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
    }
    const isPasswordValid = await user.comparePassword(loginData.password)
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned')
    }

    const { AcessToken, RefreshToken } = jwtGenerate({ id: user._id, email: user.email, role: user.role })

    await RefreshTokenModel.create({ userId: user._id, token: RefreshToken })

    await user.saveLog(loginData.ipAddress, loginData.device)
    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      fullName: user.firstName + ' ' + user.lastName
    }
    return { userData, accessToken: AcessToken, refreshToken: RefreshToken }
  } catch (error) {
    throw error
  }
}

const handleOAuthLogin = async (user, ipAddress, device) => {
  try {
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User information is missing from OAuth provider.');
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Your account has been banned');
    }

    const { AcessToken, RefreshToken } = jwtGenerate({ id: user._id, email: user.email, role: user.role });

    await RefreshTokenModel.create({ userId: user._id, token: RefreshToken });
    await user.saveLog(ipAddress, device);

    const userData = {
      userId: user._id,
      role: user.role,
      email: user.email,
      fullName: user.firstName + ' ' + user.lastName
    };
    return { userData, accessToken: AcessToken, refreshToken: RefreshToken };
  } catch (error) {
    throw error;
  }
};

const requestToken = async ({ refreshToken }) => {
  try {
    const refreshTokenDoc = await RefreshTokenModel.findOne({ token: refreshToken })
    if (!refreshTokenDoc) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh Token không hợp lệ hoặc đã hết hạn')
    }
    const newTokens = requestNewToken(refreshToken)
    return newTokens
  } catch (error) {
    throw error
  }
}

const revokeRefreshToken = async (userId) => {
  try {
    await RefreshTokenModel.deleteMany({ userId })
    return { message: 'Refresh tokens revoked successfully' }
  } catch (error) {
    throw error
  }
}

const getAllUsers = async () => {
  try {
    const users = await UserModel.find({ role: 'user' }).select('-password')
    return users
  } catch (error) {
    throw error
  }
}

const changePassword = async (userId, passwordData) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    const isCurrentPasswordValid = await user.comparePassword(passwordData.currentPassword)
    if (!isCurrentPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect')
    }
    user.password = passwordData.newPassword
    user.updatedAt = Date.now() // Update the updatedAt field
    await user.save()
    return { message: 'Password changed successfully' }
  } catch (error) {
    throw error
  }
}

const sendOTP = async (reqBody) => {
  try {
    const { email } = reqBody
    const otp = await generateAndSaveOTP(email)
    await sendMail(email, 'Your OTP Code', `Your OTP code is ${otp}`)
    return otp
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to sent send OTP email')
  }
}

const verifyOTP = async (otpData) => {
  try {
    const { email, otp } = otpData
    const otpRecord = await OTPModel.findOne({ email, otp })

    if (!otpRecord) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid OTP')
    }
    await otpRecord.verifyOTP()

    return { message: 'OTP verified successfully' }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to verify OTP')
  }
}

const resetPassword = async (reqBody) => {
  try {
    const { email, otp, newPassword } = reqBody
    const otpRecord = await OTPModel.findOne({ email, otp })

    if (!otpRecord || !otpRecord.isVerified) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired OTP')
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    user.password = newPassword
    await user.save()
    await OTPModel.deleteOne({ _id: otpRecord._id }) // Optionally delete the OTP record

    return { message: 'Password reset successfully' }
  } catch (error) {
    throw error
  }
}
// Aggregate user details after implementing other modals (Places, Checkins, etc.)
const getUserProfile = async (userId) => {
  try {
    const user = await UserModel.findById(userId).select('-password')
    if (!user || user.role !== 'user' || user._destroyed) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'This account has been banned')
    }
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const totalCheckins = await CheckinModel.countDocuments({ userId })
    const thisMonthCheckins = await CheckinModel.countDocuments({
      userId,
      createdAt: { $gte: startOfThisMonth }
    })
    const lastMonthCheckins = await CheckinModel.countDocuments({
      userId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    })
    const checkinGrowth =
      lastMonthCheckins > 0
        ? Math.round(((thisMonthCheckins - lastMonthCheckins) / lastMonthCheckins) * 100)
        : thisMonthCheckins > 0 ? 100 : 0

    const blogs = await BlogModel.find({ authorId: userId }).sort({ createdAt: -1 })
    const totalBlogs = blogs.length
    const thisMonthBlogs = await BlogModel.countDocuments({
      authorId: userId,
      createdAt: { $gte: startOfThisMonth }
    })
    const lastMonthBlogs = await BlogModel.countDocuments({
      authorId: userId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    })
    const blogGrowth =
      lastMonthBlogs > 0
        ? Math.round(((thisMonthBlogs - lastMonthBlogs) / lastMonthBlogs) * 100)
        : thisMonthBlogs > 0 ? 100 : 0

    const reviews = await ReviewModel.find({ userId })
    const totalReviews = reviews.length
    const thisMonthReviews = await ReviewModel.countDocuments({
      userId,
      createdAt: { $gte: startOfThisMonth }
    })
    const lastMonthReviews = await ReviewModel.countDocuments({
      userId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    })
    const reviewGrowth =
      lastMonthReviews > 0
        ? Math.round(((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100)
        : thisMonthReviews > 0 ? 100 : 0

    const badges = await userBadgeService.getBadgesForUser(userId)

    return {
      userId: user._id,
      email: user.email,
      phone: user.phone,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      cover: user.cover || null,
      bio: user.bio || '',
      favorites: user.favorites || [],

      checkinCount: totalCheckins,
      blogCount: totalBlogs,
      reviewCount: totalReviews,

      checkinGrowth,
      blogGrowth,
      reviewGrowth,

      blogs,
      badges
    }
  } catch (error) {
    throw error
  }
}

const getUserDetails = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
      .select('-password -__v') 
      .populate('favorites', 'name address avgRating totalRatings')
      .populate('sharedBlogs', 'title content');

    if (!user || user.role !== 'user' || user._destroyed) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'This account has been banned')
    }

    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const totalCheckins = await CheckinModel.countDocuments({ userId });
    const thisMonthCheckins = await CheckinModel.countDocuments({
      userId,
      createdAt: { $gte: startOfThisMonth }
    });
    const lastMonthCheckins = await CheckinModel.countDocuments({
      userId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });
    const checkinGrowth =
      lastMonthCheckins > 0
        ? Math.round(((thisMonthCheckins - lastMonthCheckins) / lastMonthCheckins) * 100)
        : thisMonthCheckins > 0 ? 100 : 0

    const blogs = await BlogModel.find({ authorId: userId }).sort({ createdAt: -1 })
    const totalBlogs = blogs.length
    const thisMonthBlogs = await BlogModel.countDocuments({
      authorId: userId,
      createdAt: { $gte: startOfThisMonth }
    });
    const lastMonthBlogs = await BlogModel.countDocuments({
      authorId: userId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });
    const blogGrowth =
      lastMonthBlogs > 0
        ? Math.round(((thisMonthBlogs - lastMonthBlogs) / lastMonthBlogs) * 100)
        : thisMonthBlogs > 0 ? 100 : 0

    const reviews = await ReviewModel.find({ userId });
    const totalReviews = reviews.length
    const thisMonthReviews = await ReviewModel.countDocuments({
      userId,
      createdAt: { $gte: startOfThisMonth }
    });
    const lastMonthReviews = await ReviewModel.countDocuments({
      userId,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });
    const reviewGrowth =
      lastMonthReviews > 0
        ? Math.round(((thisMonthReviews - lastMonthReviews) / lastMonthReviews) * 100)
        : thisMonthReviews > 0 ? 100 : 0

    const badges = await userBadgeService.getBadgesForUser(userId);

    return {
      userId: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      cover: user.cover || null,

      email: user.email,
      phone: user.phone,

      favorites: user.favorites || [],
      sharedBlogs: user.sharedBlogs || [],

      checkinCount: totalCheckins,
      blogCount: totalBlogs,
      reviewCount: totalReviews,

      checkinGrowth,
      blogGrowth,
      reviewGrowth,

      blogs,
      badges
    };
  } catch (error) {
    throw error
  }
}

const banUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'user') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User is already banned')
    }
    user.banned = true
    await user.save()
  } catch (error) {
    throw error
  }
}
const banSelf = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'user') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user.banned) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tài khoản đã bị khóa trước đó');
    }
    user.banned = true
    await user.save()
    return { message: 'Tài khoản của bạn đã được khóa thành công'};
  } catch (error) {
    throw error
  }
}

const destroyUser = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    if (!user || user.role !== 'user') {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    user._destroyed = true
    await user.save()
  } catch (error) {
    throw error
  }
}

const getUserReviews = async (userId) => {
  try {
    const reviews = await ReviewModel.find({ userId })
      .select('placeId comment totalLikes rating images createdAt')
    return reviews
  } catch (error) {
    throw error
  }
}

const updateUserProfile = async (userId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      emailVerified: reqBody?.emailVerified || false,
      phoneVerified: reqBody?.phoneVerified || false,
      updatedAt: Date.now() // Update the updatedAt field
    }
    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    return user
  } catch (error) {
    throw error
  }
}

const getScoreAndTitle = async (userId) => {
  try {
    const user = await UserModel.findById(userId).select('points').lean()
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const points = user.points || 0
    let title = 'Tân binh' // Default title: Newbie

    if (points >= 1000) {
      title = 'Bậc thầy' // Master
    } else if (points >= 500) {
      title = 'Nhà thám hiểm' // Adventurer
    } else if (points >= 100) {
      title = 'Người khám phá' // Explorer
    }

    return { points, title }
  } catch (error) {
    throw error
  }
}

const updateUserLocation = async (userId, longitude, latitude) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }
    user.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    await user.save();
    return { message: 'User location updated successfully' };
  } catch (error) {
    throw error;
  }
};

const getOutstandingBloggers = async () => {
  try {
    const outstandingBloggers = await BlogModel.aggregate([
      {
        $match: { status: { $ne: 'pending' } }
      },
      {
        $group: {
          _id: '$authorId',
          totalBlogs: { $sum: 1 },
          totalLikes: { $sum: '$totalLikes' },
          totalShares: { $sum: '$shareCount' }
        }
      },
      {
        $match: {
          totalBlogs: { $gt: 0 },
          totalLikes: { $gte: 0 },
          totalShares: { $gte: 0 }
        }
      },
      {
        $sort: {
          totalBlogs: -1,
          totalLikes: -1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          _id: 0,
          author: {
            _id: '$author._id',
            firstName: '$author.firstName',
            lastName: '$author.lastName',
            avatar: '$author.avatar',
            bio: '$author.bio'
          },
          totalBlogs: 1,
          totalLikes: 1,
          totalShares: 1
        }
      }
    ])
    return outstandingBloggers
  } catch (error) {
    throw error
  }
}

export const userService = {
  sendRegistrationOtp,
  register,
  login,
  handleOAuthLogin,
  resetPassword,
  requestToken,
  revokeRefreshToken,
  getAllUsers,
  changePassword,
  sendOTP,
  verifyOTP,
  getUserDetails,
  getUserProfile,
  banUser,
  banSelf,
  destroyUser,
  getUserReviews,
  updateUserProfile,
  getScoreAndTitle,
  updateUserLocation,
  getOutstandingBloggers
}
