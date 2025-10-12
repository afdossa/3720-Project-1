const { getEvents, purchaseTicket } = require('../models/clientModel');

/**
 * Controller for handling event-related operations
 * @namespace EventController
 */

/**
 * Retrieves all available events
 * @function listEvents
 * @memberof EventController
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @returns {void}
 */
const listEvents = async (req, res) => {
    try {
        const events = await getEvents();
        res.json(events);
    } catch (error) {
        console.error('Error in listEvents controller:', error);
        res.status(500).json({ 
            error: 'Failed getting event from database'
        });
    }
};

/**
 * Handles ticket purchase for a specific event
 * @function buyTicket
 * @memberof EventController
 * @param {Object} req Express request object
 * @param {string} req.params.id Event ID from URL parameters
 * @param {Object} res Express response object
 * @returns {void}
 */
const buyTicket = async (req, res) => {
    const eventId = req.params.id;
    
    try {
        const success = await purchaseTicket(eventId);
        if (success) {
            res.json({ 
                message: 'Ticket purchase was successful ',
                eventId: eventId
            });
        } else {
            res.status(400).json({ 
                error: 'Purchase failed',
                details: 'No tickets available' 
            });
        }
    } catch (error) {
        console.error('Error in buyTicket controller:', error);
        res.status(500).json({ 
            error: 'Failed to process ticket purchase'
        });
    }
};

module.exports = { listEvents, buyTicket };