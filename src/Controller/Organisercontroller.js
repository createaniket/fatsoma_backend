const Organizer = require('../models/Organizer');

const getOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find().populate('events');
    res.json(organizers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOrganizer = async (req, res) => {
  const { name, email } = req.body;
  try {
    const newOrganizer = new Organizer({ name, email });
    const savedOrganizer = await newOrganizer.save();
    res.status(201).json(savedOrganizer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getOrganizers, createOrganizer };
