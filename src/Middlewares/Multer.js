// middleware/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/Coudinaryconfig');

const getDynamicStorage = (albumTitle) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `albums/${albumTitle}`, // Dynamic folder based on album title
      allowed_formats: ['jpg', 'jpeg', 'png']
    }
  });
};

// Middleware to dynamically set storage based on album title
const albumUpload = (albumTitle) => {
  const storage = getDynamicStorage(albumTitle);
  const upload = multer({ storage });
  return upload.fields([
    { name: 'coverPhoto', maxCount: 1 },    // Single cover photo
    { name: 'photos', maxCount: 200 }       // Multiple album photos
  ]);
};

module.exports = albumUpload;
