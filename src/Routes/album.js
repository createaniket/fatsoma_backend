// routes/albumRoutes.js
const express = require('express');
const router = express.Router();
const { upload, albumUploadWithProgress } = require('../Middlewares/Multer');
const { uploadAlbum, GetAlAlbums } = require('../Controller/Albumcontroller');

// Route to upload an album with metadata and photos
router.post('/upload', upload, albumUploadWithProgress, uploadAlbum);

// Route to get all albums
router.get('/getall', GetAlAlbums);

module.exports = router;
