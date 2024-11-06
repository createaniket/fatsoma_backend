const Event = require('../Models/Events');
const Organizer = require('../Models/ Organizer');

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
}

const GetAllEvents = async (req, res) => {
 
  console.log("jcbjkvr flk")
  try {
    const events = await Event.find({});
    res.json({data:events});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const GetAllEventsbyBrandName = async (req, res) => {
  console.log("Endpoint hit for fetching events by brand name");
  const brandName = req.body.organiser; // Assuming organiser here is the brand name

  try {
    // Find events where a brand in the brands array matches the brand name
    const events = await Event.find({
      "brands": { 
        $elemMatch: { brandName: brandName } 
      }
    });

    res.json({ data: events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};








module.exports = { getEventsByOrganizer, createEvent, GetAllEvents , GetAllEventsbyBrandName};
