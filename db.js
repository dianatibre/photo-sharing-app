const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./photo-sharing.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Define database schema
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`);

    // !(remove this in production)
    db.run(`INSERT OR IGNORE INTO users (email, password) VALUES
        ('diana.tibre@gmail.com', '1234')
    `);

    // Create galleries table
    db.run(`CREATE TABLE IF NOT EXISTS galleries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        coverPhoto TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        accessLink TEXT UNIQUE
    )`);

    // Create photos table
    db.run(`CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        galleryId INTEGER NOT NULL,
        filename TEXT NOT NULL,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (galleryId) REFERENCES galleries(id)
    )`);
});

module.exports = db;
