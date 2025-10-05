const express = require('express');
const router = express.Router();
const { listEvents, buyTicket } = require('../controllers/clientController');

router.get('/events', listEvents);
router.post('/events/:id/purchase', buyTicket);

module.exports = router;