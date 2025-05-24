const express = require('express');
const { updateInterests } = require('../controllers/userController');
const router = express.Router();

// Change this route to match what the frontend is calling
router.post('/update-interests', updateInterests);

module.exports = router;