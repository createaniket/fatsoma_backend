// middlewares/multer.js
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/Coudinaryconfig');
const sharp = require('sharp');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'photos', maxCount: 200 }
]);

const uploadToCloudinary = async (buffer, folder, fileSize) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = { folder, resource_type: 'auto' };
    let imageBuffer = buffer;

    if (fileSize > 10 * 1024 * 1024) {
      // If the file size is larger than 10 MB, compress it
      sharp(buffer)
        .resize({ width: 2000 })
        .jpeg({ quality: 80 })
        .toBuffer()
        .then((compressedBuffer) => {
          imageBuffer = compressedBuffer;
          streamifier.createReadStream(imageBuffer).pipe(
            cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
              if (error) return reject(error);
              resolve(result);  // Returning the result from Cloudinary upload
            })
          );
        })
        .catch(reject);
    } else {
      // No compression if the file is small
      streamifier.createReadStream(imageBuffer).pipe(
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result);  // Returning the result from Cloudinary upload
        })
      );
    }
  });
};

// Middleware function for album upload with progress tracking
const albumUploadWithProgress = async (req, res, next) => {
  try {
    const dateFolder = new Date().toISOString().split('T')[0];
    const totalFiles = req.files?.photos?.length + 1 || 1;
    let uploadedCount = 0;
    let photosData = [];  // To store photo data for MongoDB

    const updateProgress = () => {
      const percentage = Math.floor((uploadedCount / totalFiles) * 100);
      console.log(`Progress: ${percentage}% (${uploadedCount}/${totalFiles})`);
    };

    // Upload cover photo if it exists
    if (req.files.coverPhoto) {
      const coverPhotoFile = req.files.coverPhoto[0];
      const coverPhotoResult = await uploadToCloudinary(coverPhotoFile.buffer, `albums/${dateFolder}`, coverPhotoFile.size);
      uploadedCount++;
      updateProgress();

      // Store cover photo info in MongoDB
      photosData.push({
        url: coverPhotoResult.url,
        public_id: coverPhotoResult.public_id
      });
    }

    // Upload other photos and track progress
    if (req.files.photos) {
      for (const file of req.files.photos) {
        const photoResult = await uploadToCloudinary(file.buffer, `albums/${dateFolder}`, file.size);
        uploadedCount++;
        updateProgress();

        // Store photo info in MongoDB
        photosData.push({
          url: photoResult.url,
          public_id: photoResult.public_id
        });
      }
    }

    // Attach the photo data to the request body for use in the controller
    req.photosData = photosData;

    next(); // Pass control to the next middleware or controller function
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Error uploading files' });
  }
};

module.exports = { upload, albumUploadWithProgress };
