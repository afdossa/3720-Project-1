const { getEvents, purchaseTicket } = require('../models/clientModel');

const listEvents = async (req, res) => {
    try {
        const events = await getEvents();
        res.json(events);
    } catch (error) {
        console.error('Error in listEvents controller:', error);
        res.status(500).json({ 
            error: 'Failed to fetch events from database'
        });
    }
};

const buyTicket = async (req, res) => {
    const eventId = req.params.id;
    
    try {
        const success = await purchaseTicket(eventId);
        if (success) {
            res.json({ 
                message: 'Ticket purchased successfully',
                eventId: eventId
            });
        } else {
            res.status(400).json({ 
                error: 'Purchase failed',
                details: 'No tickets available or event not found'
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