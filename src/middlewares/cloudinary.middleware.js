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
