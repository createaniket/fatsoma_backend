// models/Album.js
const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  club: { type: String, required: true },
  eventName: { type: String },
  tags: [String],
  coverPhoto: { type: String },
  photos: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema);
