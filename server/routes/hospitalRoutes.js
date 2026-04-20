const express = require('express');
const router = express.Router();
const { getHospitals, bookToken, getQueueStatus } = require('../controllers/hospitalController');

router.get('/hospitals', getHospitals);
router.post('/book', bookToken);
router.get('/queue-status', getQueueStatus);

module.exports = router;
