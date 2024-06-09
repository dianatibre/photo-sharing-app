const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const path = require('path');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key', // Change this to a secure random string
    resave: false,
    saveUninitialized: true
}));

// Serve static files
app.use(express.static('public'));

// Require the sqlite3 module
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database('./photo-sharing.db');

// Import authRoutes
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
app.use(authRoutes);
app.use(galleryRoutes);
app.use(uploadRoutes);

app.use(express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
