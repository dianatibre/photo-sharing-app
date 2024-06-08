const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./photo-sharing.db');

// Route for rendering the page with galleries
router.get('/manage-galleries', (req, res) => {
    // Fetch galleries from the database
    db.all('SELECT * FROM galleries', (err, rows) => {
        if (err) {
            console.error('Error fetching galleries:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        // Render the page with fetched galleries and username
        res.render('manage-galleries', { galleries: rows, username: req.session.user });
    });
});

// Route for creating a new gallery
router.post('/create-gallery', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const { galleryTitle, galleryDate } = req.body;

    // Validate input (gallery title and date)
    if (!galleryTitle || !galleryDate) {
        return res.status(400).send('Gallery title and date are required');
    }

    // Insert the new gallery into the database with the selected date
    db.run('INSERT INTO galleries (title, date) VALUES (?, ?)', [galleryTitle, galleryDate], (err) => {
        if (err) {
            console.error('Error creating gallery:', err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/manage-galleries'); // Redirect to manage galleries page after successful creation
    });
});

// View gallery details by ID
router.get('/gallery/:id', (req, res) => {
    const galleryId = req.params.id;

    // Query the database to retrieve the gallery details
    db.get('SELECT * FROM galleries WHERE id = ?', [galleryId], (err, gallery) => {
        if (err) {
            console.error('Error retrieving gallery:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }

        // Gallery found, send it as a response
        res.json(gallery);
    });
});

module.exports = router;
