const express = require('express');
const { getEventsByOrganizer, createEvent, GetAllEvents , GetAllEventsbyBrandName} = require('../Controller/Eventcontroller');
const router = express.Router();



router.get('/getall',GetAllEvents )

router.get('/getall/bybrand',GetAllEventsbyBrandName )





module.exports = router;
