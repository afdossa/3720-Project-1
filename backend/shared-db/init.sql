/**
 * Database initialization script for Tiger Tix System
 * Creates events table and populates with sample data
 */

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    tickets_available INTEGER NOT NULL DEFAULT 0
);

/*
*Example data to populate database for testing
*/
INSERT OR IGNORE INTO events (id, name, date, tickets_available) VALUES
(1, 'Clemson Football Game', '2025-09-01', 100),
(2, 'Campus Concert', '2025-09-10', 50),
(3, 'Career Fair', '2025-09-15', 200);