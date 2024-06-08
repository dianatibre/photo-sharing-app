const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./photo-sharing.db');
const multer = require('multer'); // For handling file uploads
const upload = multer({ dest: 'uploads/' }); // Set upload destination folder

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

// // View gallery details by ID
// router.get('/gallery/:id', (req, res) => {
//     const galleryId = req.params.id;
//
//     // Query the database to retrieve the gallery details
//     db.get('SELECT * FROM galleries WHERE id = ?', [galleryId], (err, gallery) => {
//         if (err) {
//             console.error('Error retrieving gallery:', err);
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//
//         if (!gallery) {
//             return res.status(404).json({ error: 'Gallery not found' });
//         }
//
//         // Gallery found, send it as a response
//         res.json(gallery);
//     });
// });

// Route for managing pictures within a gallery
router.get('/gallery/:id/manage-gallery', (req, res) => {
    const galleryId = req.params.id;

    // Query the database to retrieve gallery details and photos for the specified gallery
    db.get('SELECT title FROM galleries WHERE id = ?', [galleryId], (err, gallery) => {
        if (err) {
            console.error('Error retrieving gallery details:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }

        // Query the database to retrieve photos for the specified gallery
        db.all('SELECT * FROM photos WHERE galleryId = ?', [galleryId], (err, photos) => {
            if (err) {
                console.error('Error retrieving photos:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Render the page with fetched photos and the gallery name
            res.render('manage-gallery', { galleryId, galleryName: gallery.title, photos });
        });
    });
});



// Route for uploading a new picture to a gallery
router.post('/gallery/:id/upload-picture', upload.single('picture'), (req, res) => {
    const galleryId = req.params.id;
    const pictureFile = req.file;

    // Logic to save pictureFile.filename to the database for the specified gallery
    // Redirect back to the manage pictures page
});

// Route for deleting a picture from a gallery
router.delete('/gallery/:galleryId/picture/:pictureId', (req, res) => {
    const { galleryId, pictureId } = req.params;

    // Logic to delete the specified picture from the database
    // Redirect back to the manage pictures page
});

// Route for deleting the entire gallery
router.post('/gallery/:id/delete', (req, res) => {
    const galleryId = req.params.id;

    // Step 1: Delete pictures associated with the gallery
    db.run('DELETE FROM photos WHERE galleryId = ?', [galleryId], (err) => {
        if (err) {
            console.error('Error deleting pictures:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Step 2: Delete the gallery itself
        db.run('DELETE FROM galleries WHERE id = ?', [galleryId], (err) => {
            if (err) {
                console.error('Error deleting gallery:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Gallery and associated pictures successfully deleted
            // Redirect back to the gallery management page
            res.redirect('/manage-galleries');
        });
    });
});


module.exports = router;
