const express = require('express');
const { getOrganizers, createOrganizer } = require('../Controller/Organisercontroller');
const router = express.Router();

router.route('/')
  .get(getOrganizers)
  .post(createOrganizer);

module.exports = router;
