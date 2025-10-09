const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//connect to shared database
const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // This will create tables if they don't exist
    const initScript = require('fs').readFileSync(
        path.join(__dirname, '../../shared-db/init.sql'),
        'utf8'
    );
    db.exec(initScript, (err) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database initialized successfully');
        }
    });
});

/**
 * Creates a new event in the database
 * @param {string} name - Event name
 * @param {string} date - Event date
 * @param {number} tickets_available - Number of available tickets
 * @returns {Promise<Object>} The created event object
 */
const createEvent = (name, date, tickets_available) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO events (name, date, tickets_available)
            VALUES (?, ?, ?)
        `;

        db.run(sql, [name, date, tickets_available], function(err) {
            if (err) {
                console.error('Database error in createEvent:', err);
                reject(err);
            } else {
                const newEvent = {
                    id: this.lastID,
                    name: name,
                    date: date,
                    tickets_available: tickets_available
                };
                console.log(`Created new event: ${name} with ${tickets_available} tickets`);
                resolve(newEvent);
            }
        });
    });
};

/**
 * Updates an existing event
 * @param {number} eventId - The id of the event to update
 * @param {string} name - Updated event name
 * @param {string} date - Updated event date
 * @param {number} tickets_available - Updated number of tickets
 * @returns {Promise<boolean>} True if update worked
 */
const updateEvent = (eventId, name, date, tickets_available) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE events
            SET name = ?, date = ?, tickets_available = ?
            WHERE id = ?
        `;

        db.run(sql, [name, date, tickets_available, eventId], function(err) {
            if (err) {
                console.error('Database error in updateEvent:', err);
                reject(err);
            } else if (this.changes > 0) {
                console.log(`✏Updated event ${eventId}`);
                resolve(true);
            } else {
                console.log(`Event ${eventId} not found for update`);
                resolve(false);
            }
        });
    });
};

/**
 * Deletes an event from the database
 * @param {number} eventId - The id of the event to delete
 * @returns {Promise<boolean>} True if deleted
 */
const deleteEvent = (eventId) => {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM events WHERE id = ?`;

        db.run(sql, [eventId], function(err) {
            if (err) {
                console.error('Database error in deleteEvent:', err);
                reject(err);
            } else if (this.changes > 0) {
                console.log(`Deleted event ${eventId}`);
                resolve(true);
            } else {
                console.log(`Event ${eventId} not found for deletion`);
                resolve(false);
            }
        });
    });
};

/**
 *Gets all events from database
 *@returns {Promise<Array>} Array of event objects
 */
const getEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, name, date, tickets_available FROM events`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Database error in getEvents:', err);
                reject(err);
            } else {
                console.log(`Admin fetched ${rows.length} events from database`);
                resolve(rows);
            }
        });
    });
};

/**
 * Gets a specific event by id
 * @param {number} eventId - The id of the event to get
 * @returns {Promise<Object>} The event object
 */
const getEventById = (eventId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, name, date, tickets_available FROM events WHERE id = ?`;
        db.get(sql, [eventId], (err, row) => {
            if (err) {
                console.error('Database error in getEventById:', err);
                reject(err);
            } else if (row) {
                resolve(row);
            } else {
                console.log(`Event ${eventId} not found`);
                resolve(null);
            }
        });
    });
};

module.exports = {createEvent, updateEvent, deleteEvent, getEvents, getEventById};

