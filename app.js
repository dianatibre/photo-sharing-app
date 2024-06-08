const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

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
app.use(authRoutes);
app.use(galleryRoutes);

// Route for updating a specific gallery
app.post('/gallery/:id', (req, res) => {
    // Logic to update the gallery details in the database based on ID
    // Redirect back to the gallery management page or main management page
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
