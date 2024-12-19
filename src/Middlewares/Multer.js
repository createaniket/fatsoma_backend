const multer = require('multer');
const sharp = require('sharp');
const streamifier = require('streamifier');
const cloudinary = require('../config/Coudinaryconfig');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'coverPhoto', maxCount: 1 },
]);

const uploadToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .resize({ width: 2000 }) // Resize image to 2000px width
      .jpeg({ quality: 80 }) // Compress image to 80% quality
      .toBuffer()
      .then((compressedBuffer) => {
        streamifier.createReadStream(compressedBuffer).pipe(
          cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          })
        );
      })
      .catch(reject);
  });
};

module.exports = { upload, uploadToCloudinary };
