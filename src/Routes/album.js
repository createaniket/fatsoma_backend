const express = require('express');
const router = express.Router();
const { upload } = require('../Middlewares/Multer');
const { uploadAlbum, GetAlAlbums , GetAlAlbumById} = require('../Controller/Albumcontroller');

// Route to upload an album with metadata and photos
router.post('/upload', upload, uploadAlbum);

// Route to get all albums
router.get('/getall', GetAlAlbums);

router.get('/get/:id', GetAlAlbumById);


module.exports = router;
