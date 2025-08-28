const Album = require('../Models/Albums');
const { uploadToCloudinary } = require('../Middlewares/Multer');













const uploadAlbum = async (req, res) => {
  console.log("the bodyiioiiioiooi", req.body.dropboxImages)

  console.log("the body", req.body)

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


// const GetAlAlbumById = async (req, res) => {
//   try {
//     const albums = await Album.find()
//       .sort({ createdAt: -1 })  // latest first
//       .limit(50);               // only 50 items

//     res.status(200).json({ message: 'Latest 50 Albums', data: albums });
//   } catch (error) {
//     console.error('Error fetching albums:', error);
//     res.status(500).json({ error: 'Error fetching albums' });
//   }
// };



const GetAlAlbumById = async (req, res) => {
  console.log("ism shegtehe")
  try {
    const AlbumId = req.params.id;
  console.log("AlbumIdAlbumIdAlbumIdAlbumId", AlbumId)

    const SingleAlbum = await Album.findById(AlbumId); // Sort by date in descending order
    res.status(200).json({ message: 'All Albums', data: SingleAlbum });
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Error fetching albums' });
  }
};




// Controller to increase likes for a photo
const increaseLikes = async (req, res) => {
  console.log("i have been hit oncrease llike")
  try {
    const { albumId, photoId } = req.params; // Expecting albumId and photoId in the request params

    console.log("albumid ffro resct", albumId)

    console.log("phto ffro resct", photoId)

    // Find the album by its ID
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Find the photo in the album by its ID
    const photo = album.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Increase the likes by 1
    photo.likes += 1;

    // Save the updated album
    await album.save();

    return res.status(200).json({ message: 'Photo like updated successfully', album });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



// Controller to increase downloads for a photo
const increaseDownloads = async (req, res) => {
  try {
    const { albumId, photoId } = req.params; // Expecting albumId and photoId in the request params

    // Find the album by its ID
    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    // Find the photo in the album by its ID
    const photo = album.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Increase the downloads by 1
    photo.downloads += 1;

    // Save the updated album
    await album.save();

    return res.status(200).json({ message: 'Photo download updated successfully', album });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadAlbum, GetAlAlbums, GetAlAlbumById, increaseLikes, increaseDownloads};
