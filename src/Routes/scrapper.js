// eventRoutes.js
const express = require('express');
const router = express.Router();
const ScrapeController = require('../Controller/ScrapperController'); // Adjust the path as necessary

// Define a route for scraping events
router.get('/scrape', ScrapeController.scrapeEvents);

module.exports = router;
