const Album = require('../Models/Albums');
const { uploadToCloudinary } = require('../Middlewares/Multer');













const uploadAlbum = async (req, res) => {
  console.log("the body", req.body.dropboxImages)
  try {
    const { title, club, eventName, tags, date, venue, dropboxImages } = req.body;
    const coverPhotoFile = req.files?.coverPhoto?.[0]; // Single cover photo

    if (!coverPhotoFile) {
      return res.status(400).json({ error: 'Cover photo is required' });
    }

    // Parse dropboxImages if it's a stringified array
    let dropboxImagesArray;
    try {
      dropboxImagesArray = typeof dropboxImages === 'string' ? JSON.parse(dropboxImages) : dropboxImages;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON format for dropboxImages' });
    }

    if (!Array.isArray(dropboxImagesArray)) {
      return res.status(400).json({ error: 'dropboxImages must be an array' });
    }

    // Upload cover photo to Cloudinary
    const coverPhotoUpload = await uploadToCloudinary(coverPhotoFile.buffer, 'albums/cover_photos');

    // Process dropboxImages to create photo objects
    const photos = dropboxImagesArray.map((imageUrl) => ({
      url: imageUrl,
      downloads: 0,
      likes: 0,
    }));

    // Create the album document
    const album = new Album({
      title,
      club,
      eventName,
      date,
      venue,
      tags: tags.split(',').map((tag) => tag.trim()),
      coverPhoto: coverPhotoUpload.secure_url,
      photos, // Attach the processed photos array
    });

    await album.save();
    res.status(201).json({ status: 201, message: 'Album uploaded successfully', album });
  } catch (error) {
    console.error('Error uploading album:', error);
    res.status(500).json({ error: 'Error uploading album' });
  }
};








const GetAlAlbums = async (req, res) => {
  try {
    const albums = await Album.find({}).sort({ date: -1 }); // Sort by date in descending order
    res.status(200).json({ message: 'All Albums', data: albums });
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Error fetching albums' });
  }
};

module.exports = { uploadAlbum, GetAlAlbums };
