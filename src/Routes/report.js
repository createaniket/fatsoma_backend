const express = require('express');
const { getReport } = require('../Controller/Reportcontroller');
const router = express.Router();

router.get('/:organizerId/:eventId/:reportType', getReport);

module.exports = router;
