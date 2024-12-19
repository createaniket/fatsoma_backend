const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    club: { type: String, required: true },
    venue: { type: String },
    date: { type: Date },
    eventName: { type: String },
    tags: [String],
    coverPhoto: { type: String },
    photos: [
      {
        url: { type: String, required: true },
        likes: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Album', albumSchema);
