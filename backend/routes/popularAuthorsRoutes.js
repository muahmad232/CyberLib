// routes/popularAuthorsRoutes.js
const express = require('express');
const router = express.Router();
const { getPopularAuthors } = require('../controllers/popularauthorsController');

router.get('/', getPopularAuthors);

module.exports = router;