const express = require('express');
const router = express.Router();

/**
 * Admin routes for event management
 * Defines REST API endpoints for admin operations
 */
module.exports = function(adminController) {

    /**
     * POST /api/admin/events
     * Creates a new event
     * Expects JSON body: { name: string, date: string, ticket_count: number }
     */
    router.post('/events', (req, res) => adminController.createEvent(req, res));

    return router;
};