const mongoose = require('mongoose');

const dropboxTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const DropboxToken = mongoose.model('DropboxToken', dropboxTokenSchema);

module.exports = DropboxToken;
