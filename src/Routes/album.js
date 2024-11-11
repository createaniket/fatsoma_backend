// routes/albums.js
const express = require('express');
const router = express.Router();
const albumUpload = require('../Middlewares/Multer'); // Use the updated multer config
const { uploadAlbum } = require('../Controller/Albumcontroller');


// Route to upload an album with metadata and photos
router.post('/upload',  (req, res, next) => {
    const { title } = req.body;  // Extract album title from request body

    const upload = albumUpload(title);  // Pass album title to middleware
    upload(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error uploading files' });
      }
      next();
    });
  }, uploadAlbum



);
  
  module.exports = router;

