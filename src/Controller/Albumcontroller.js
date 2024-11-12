// controllers/albumController.js
const Album = require('../Models/Abums');

const uploadAlbum = async (req, res) => {
  try {
    const { title, club, eventName, tags, date, venue } = req.body;
    const coverPhotoFile = req.files?.coverPhoto?.[0];

    if (!coverPhotoFile) {
      return res.status(400).json({ error: 'Cover photo is required' });
    }

    // Use the photos data that was stored in the middleware
    const photos = req.photosData; // This contains all the URLs and public_ids of photos

    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    const album = new Album({
      title,
      club,
      eventName,
      date,
      venue,
      tags: tags.split(',').map(tag => tag.trim()),
      coverPhoto: photos[0].url,  // Assuming the first photo is the cover photo
      photos // This is an array of photo objects with URLs and public_ids
    });

    await album.save();
    res.status(201).json({ status:201,message: 'Album uploaded successfully', album });
  } catch (error) {
    console.error('Error uploading album:', error);
    res.status(500).json({ error: 'Error uploading album' });
  }
};


const GetAlAlbums = async (req, res) => {


  
  try {

    const result = await Album.find({})
    console.log("dcbjrvkbkjv", result)

    res.status(200).json({
      message:"All Albums",
      data:result
    })

    
  } catch (error) {
    
    console.error('Error fetching album:', error);
    res.status(500).json({ error: 'Error fetching album' });
  }



}

module.exports = { uploadAlbum, GetAlAlbums };
