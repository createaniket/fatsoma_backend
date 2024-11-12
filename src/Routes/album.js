const express = require('express');
const router = express.Router();
const albumUpload = require('../Middlewares/Multer');  // Updated multer config
const { uploadAlbum, GetAlAlbums } = require('../Controller/Albumcontroller');

// Route to upload an album with metadata and photos
router.post('/upload', (req, res, next) => {

    const upload = albumUpload('default_album'); // Default folder name if title is undefined

    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error uploading files', details: err.message });
        }
        // Pass to the controller if title and files exist
        uploadAlbum(req, res);
    });
});


router.get('/getall', GetAlAlbums)

module.exports = router;
