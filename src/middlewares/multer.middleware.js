import multer from 'multer';

const storage = multer.memoryStorage();

const uploadFiles = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // max chung = 100MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage && file.size > 10 * 1024 * 1024) {
      return cb(new Error('Ảnh không được vượt quá 10MB'));
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      return cb(new Error('Video không được vượt quá 100MB'));
    }
    cb(null, true);
  },
});

export { uploadFiles };
