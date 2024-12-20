const express = require('express');
const router = express.Router();
const { upload } = require('../Middlewares/Multer');
const { uploadAlbum, GetAlAlbums , GetAlAlbumById, increaseLikes, increaseDownloads} = require('../Controller/Albumcontroller');

// Route to upload an album with metadata and photos
router.post('/upload', upload, uploadAlbum);

// Route to get all albums
router.get('/getall', GetAlAlbums);

router.get('/get/:id', GetAlAlbumById);

// Route to increase likes for a specific photo
router.patch('/albums/:albumId/photos/:photoId/increase-likes', increaseLikes);

// Route to increase downloads for a specific photo
router.patch('/albums/:albumId/photos/:photoId/increase-downloads', increaseDownloads);


module.exports = router;
