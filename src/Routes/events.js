const express = require('express');
const { getEventsByOrganizer, createEvent } = require('../Controller/Eventcontroller');
const router = express.Router();

router.route('/:organizerId')
  .get(getEventsByOrganizer)
  .post(createEvent);

module.exports = router;
