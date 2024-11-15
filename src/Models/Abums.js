// models/Album.js
const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  club: { type: String, required: true },
  venue: { type: String},
  date: { type: Date},

  eventName: { type: String },
  tags: [String],
  coverPhoto: { type: String },
  photos: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      likes: { type: Number, default: 0 }, // Track number of likes
      downloads: { type: Number, default: 0 },
      comments: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
          text: { type: String, required: true },
          date: { type: Date, default: Date.now }
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema);
