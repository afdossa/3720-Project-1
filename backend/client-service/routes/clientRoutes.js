const express = require('express');
const router = express.Router();
const { listEvents, buyTicket } = require('../controllers/clientController');

/**
 * Client API routes for event management and ticket purchasing
 * @namespace ClientRoutes
 */

/**
 * Route to get all available events
 * @name GetEvents
 * @route {GET} /events
 * @returns {Object[]} Array of event objects
 */
router.get('/events', listEvents);

/**
 * Route to purchase a ticket for a specific event
 * @name PurchaseTicket
 * @route {POST} /events/:id/purchase
 * @routeparam {string} :id - Event identifier
 * @returns {Object} Purchase confirmation or give error
 */
router.post('/events/:id/purchase', buyTicket);

module.exports = router;