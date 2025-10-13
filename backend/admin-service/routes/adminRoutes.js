const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

// GET all events
router.get('/events', (req, res) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(rows);
    });
});

// POST create new event
router.post('/events', (req, res) => {
    const { name, date, tickets_available } = req.body;
    if (!name || !date || !tickets_available) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    db.run(
        'INSERT INTO events (name, date, tickets_available) VALUES (?, ?, ?)',
        [name, date, tickets_available],
        function (err) {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ message: 'Failed to create event' });
            }
            res.status(201).json({ id: this.lastID, name, date, tickets_available });
        }
    );
});

module.exports = router;
