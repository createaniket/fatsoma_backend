// controllers/albumController.js
const Album = require('../Models/Abums');

const uploadAlbum = async (req, res) => {
  try {
    const { title, club, eventName, tags, date, venue } = req.body;


    // Access the cover photo from req.files
    const coverPhotoFile = req.files?.coverPhoto?.[0]; // Use optional chaining to avoid undefined errors
    if (!coverPhotoFile) {
      return res.status(400).json({ error: 'Cover photo is required' });
    }

    // Set up cover photo details
    const coverPhoto = {
      url: coverPhotoFile.path,
      public_id: coverPhotoFile.filename
    };


    // Access album photos from req.files
    const photos = req.files.photos?.map((file) => ({
      url: file.path,
      public_id: file.filename
    }));

    // Create and save the album document
    const album = new Album({
      title,
      club,
      eventName,
      date,
      venue,
      tags: tags.split(',').map(tag => tag.trim()),
      coverPhoto: coverPhoto.url,
      photos
    });

    await album.save();
    res.status(201).json({ message: 'Album uploaded successfully', album });
  } catch (error) {
    console.error('Error uploading album:', error);
    res.status(500).json({ error: 'Error uploading album' });
  }
};


const GetAlAlbums = async (req, res) => {


  
  try {

    const result = Album.find({})

    res.status(200).json({
      message:"All Albums",
      data:result
    })

    
  } catch (error) {
    
    console.error('Error uploading album:', error);
    res.status(500).json({ error: 'Error fetching album' });
  }



}
module.exports = {
  uploadAlbum,
  GetAlAlbums
};
