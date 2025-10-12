const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * Database setup and initialization script
 * Runs on server start to ensure database is properly configured
 */
const setupDatabase = () => {
    return new Promise((resolve, reject) => {
        console.log('Starting database setup');

        const dbPath = path.join(__dirname, '../shared-db/database.sqlite');
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error connecting to database:', err.message);
                reject(err);
                return;
            }

            console.log('Connected to SQLite database');
        });

        // Check if init.sql exists
        const initScriptPath = path.join(__dirname, '../shared-db/init.sql');

        if (!fs.existsSync(initScriptPath)) {
            console.error('init.sql file not found at:', initScriptPath);
            reject(new Error('init.sql file not found'));
            return;
        }

        // Read and execute initialization script
        fs.readFile(initScriptPath, 'utf8', (err, sql) => {
            if (err) {
                console.error('Error reading init.sql:', err);
                reject(err);
                return;
            }

            console.log('Executing database initialization script...');

            // Execute the initialization script
            db.exec(sql, (err) => {
                if (err) {
                    console.error('Error initializing database:', err);
                    reject(err);
                } else {
                    console.log('Database tables initialized successfully');

                    // Verify the events table exists and has data
                    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                        if (err) {
                            console.error('Error verifying tables:', err);
                            reject(err);
                        } else {
                            console.log('Available tables:', tables.map(t => t.name).join(', '));

                            // Count events for verification
                            db.get("SELECT COUNT(*) as count FROM events", (err, row) => {
                                if (err) {
                                    console.error('Error counting events:', err);
                                    reject(err);
                                } else {
                                    console.log(`Total events in database: ${row.count}`);

                                    // Show sample events
                                    db.all("SELECT id, name, tickets_available FROM events LIMIT 3", (err, events) => {
                                        if (err) {
                                            console.error('Error fetching sample events:', err);
                                        } else {
                                            console.log('Sample events:');
                                            events.forEach(event => {
                                                console.log(`   - ${event.name} (ID: ${event.id}, Tickets: ${event.tickets_available})`);
                                            });
                                        }

                                        db.close((closeErr) => {
                                            if (closeErr) {
                                                console.error('Error closing database:', closeErr);
                                            } else {
                                                console.log('Database connection closed');
                                            }
                                            resolve();
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
};

// Run setup if this file is executed directly
if (require.main === module) {
    console.log('Running database setup standalone...');
    setupDatabase()
        .then(() => {
            console.log('Database setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = setupDatabase;