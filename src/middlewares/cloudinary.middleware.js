// middlewares/cloudinary.middleware.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config(); // Load .env

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


// Upload buffer lên Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'blogs', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Middleware upload blog files
export const uploadBlogFiles = async (req, res, next) => {
  try {
    const files = req.files || [];
    const cloudFiles = { mainImage: null, album: [], content: [] };

    for (const file of files) {
      const mimeType = file.mimetype;

      if (mimeType.startsWith('image/')) {
        const url = await uploadToCloudinary(file.buffer, 'blogs', 'image');

        if (!cloudFiles.mainImage) cloudFiles.mainImage = url;

        if (cloudFiles.album.filter(a => a.type === 'image').length < 30)
          cloudFiles.album.push({ type: 'image', url });

        cloudFiles.content.push({ type: 'image', url });
      }

      if (mimeType.startsWith('video/')) {
        const url = await uploadToCloudinary(file.buffer, 'blogs', 'video');

        if (cloudFiles.album.filter(a => a.type === 'video').length < 5)
          cloudFiles.album.push({ type: 'video', url });

        cloudFiles.content.push({ type: 'video', url });
      }
    }

    req.cloudFiles = cloudFiles;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware upload place images
export const uploadPlaceImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const imageUrls = [];

    for (const file of files) {
      const url = await uploadToCloudinary(file.buffer, 'places', 'image');
      imageUrls.push(url);
    }

    // Thêm các URL mới vào req.body.images, giữ lại các URL cũ nếu có
    req.body.images = [...(req.body.images || []), ...imageUrls];

    next();
  } catch (error) {
    next(error);
  }
};

// Upload cho Comment (chỉ ảnh)
export const uploadCommentImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const urls = [];

    for (const file of files) {
      const url = await uploadToCloudinary(file.buffer, 'comments', 'image');
      urls.push(url);
    }

    req.body = {
      ...req.body,
      images: [...(req.body.images || []), ...urls]
    };
    next();
  } catch (error) {
    next(error);
  }
};

// Upload cho Avatar người dùng
export const uploadAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return next();

    const url = await uploadToCloudinary(file.buffer, 'avatars', 'image');

    req.body.avatar = url;

    next();
  } catch (error) {
    next(error);
  }
};