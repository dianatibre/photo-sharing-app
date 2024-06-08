const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./photo-sharing.db');

// Fake user database (replace with a real database)
const users = [];

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database to check if the user exists and the password is correct
    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], (err, user) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (!user || user.password !== password) {
            return res.status(401).send('Invalid email or password');
        }

        req.session.user = email; // Set session to indicate user is logged in
        res.redirect('/manage-galleries'); // Redirect to galleries page after successful login
    });
});

// Logout route
router.post('/logout', (req, res) => {
    // Destroy session data to log out the user
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ error: 'An error occurred while logging out' });
        }
        // Redirect or send response as needed
        res.redirect('/');
    });
});

module.exports = router;
