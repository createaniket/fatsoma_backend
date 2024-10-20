const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  venue: { type: String },
  sales: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  totalIn: { type: Number, default: 0 },
  totalOut: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  announced: { type: Boolean, default: false },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' }
});

module.exports = mongoose.model('Event', eventSchema);
