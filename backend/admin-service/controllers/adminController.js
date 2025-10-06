const { createEvent, updateEvent, deleteEvent, getEvents, getEventById } = require('../models/adminModel');

const createNewEvent = async (req, res) => {
    const { name, date, tickets_available } = req.body;

    try {
        const newEvent = await createEvent(name, date, tickets_available);
        res.status(201).json({
            message: 'Event created successfully',
            event: newEvent
        });
    } catch (error) {
        console.error('Error in createNewEvent controller:', error);
        res.status(500).json({
            error: 'Failed to create event in database'
        });
    }
};

const updateExistingEvent = async (req, res) => {
    const eventId = req.params.id;
    const { name, date, tickets_available } = req.body;

    try {
        const success = await updateEvent(eventId, name, date, tickets_available);
        if (success) {
            res.json({
                message: 'Event updated successfully',
                eventId: eventId
            });
        } else {
            res.status(404).json({
                error: 'Update failed',
                details: 'Event not found'
            });
        }
    } catch (error) {
        console.error('Error in updateExistingEvent controller:', error);
        res.status(500).json({
            error: 'Failed to update event'
        });
    }
};

const deleteExistingEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const success = await deleteEvent(eventId);
        if (success) {
            res.json({
                message: 'Event deleted successfully',
                eventId: eventId
            });
        } else {
            res.status(404).json({
                error: 'Deletion failed',
                details: 'Event not found'
            });
        }
    } catch (error) {
        console.error('Error in deleteExistingEvent controller:', error);
        res.status(500).json({
            error: 'Failed to delete event'
        });
    }
};

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

const getEvent = async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await getEventById(eventId);
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({
                error: 'Event not found'
            });
        }
    } catch (error) {
        console.error('Error in getEvent controller:', error);
        res.status(500).json({
            error: 'Failed to fetch event from database'
        });
    }
};

module.exports = {createNewEvent, updateExistingEvent, deleteExistingEvent, listEvents, getEvent};