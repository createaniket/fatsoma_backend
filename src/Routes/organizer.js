const express = require('express');
const { getOrganizers, createOrganizer } = require('../controllers/organizerController');
const router = express.Router();

router.route('/')
  .get(getOrganizers)
  .post(createOrganizer);

module.exports = router;
