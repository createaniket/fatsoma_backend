const Event = require('../models/Event');
const Organizer = require('../models/Organizer');

const getEventsByOrganizer = async (req, res) => {
  const { organizerId } = req.params;
  try {
    const events = await Event.find({ organizer: organizerId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEvent = async (req, res) => {
  const { title, date, time, venue, sales, revenue, organizerId } = req.body;
  try {
    const newEvent = new Event({
      title, date, time, venue, sales, revenue, organizer: organizerId
    });
    const savedEvent = await newEvent.save();
    await Organizer.findByIdAndUpdate(organizerId, { $push: { events: savedEvent._id } });
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getEventsByOrganizer, createEvent };
