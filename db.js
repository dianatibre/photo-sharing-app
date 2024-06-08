// db.js

const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./photo-sharing.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;

// Define database schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS galleries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        accessLink TEXT UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        galleryId INTEGER NOT NULL,
        filename TEXT NOT NULL,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (galleryId) REFERENCES galleries(id)
    )`);
});

module.exports = db;