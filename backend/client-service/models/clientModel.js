const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//Connect to shared database system in sql lite
const dbPath = path.join(__dirname, '../../shared-db/database.sqlite');
const db = new sqlite3.Database(dbPath);

//initialize database on first run
db.serialize(() => {
    //this will create tables if they don't exist
    const initScript = require('fs').readFileSync(
        path.join(__dirname, '../../shared-db/init.sql'), 
        'utf8'
    );
    db.exec(initScript, (err) => {
        if (err) {
            console.error('Database could not be created:', err);
        } else {
            console.log('Database initialized successfully');
        }
    });
});

/**
 * Fetches all events from SQLite database
 * @returns {Promise<Array>} Array of event objects
 */
const getEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, name, date, tickets_available FROM events`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Database error in getEvents:', err);
                reject(err);
            } else {
                console.log(`Fetched ${rows.length} events from database`);
                resolve(rows);
            }
        });
    });
};

/**
 * Purchases a ticket with concurrency protection
 * @param {number} eventId - The ID of the event
 * @returns {Promise<boolean>} True if purchase succeeded
 */
const purchaseTicket = (eventId) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const sql = `
                UPDATE events 
                SET tickets_available = tickets_available - 1 
                WHERE id = ? AND tickets_available > 0
            `;
            
            db.run(sql, [eventId], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    console.error('Database error in purchaseTicket:', err);
                    reject(err);
                } else if (this.changes > 0) {
                    db.run('COMMIT');
                    console.log(`Ticket purchased for event ${eventId}`);
                    resolve(true);
                } else {
                    db.run('ROLLBACK');
                    console.log(`No tickets available for event ${eventId}`);
                    resolve(false);
                }
            });
        });
    });
};

module.exports = { getEvents, purchaseTicket };