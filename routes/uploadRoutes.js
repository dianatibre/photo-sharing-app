const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./photo-sharing.db');
const multer = require('multer'); // For handling file uploads
const fs = require('fs');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});

const upload = multer({ storage: storage });// Set upload destination folder

// Route to handle photo uploads
router.post('/gallery/:id/upload-photos', upload.array('photos', 500), (req, res) => {
    const galleryId = req.params.id;
    const files = req.files;

    if (!files) {
        return res.status(400).send('No files were uploaded.');
    }

    // Insert uploaded files into the database
    const insertPhotos = db.prepare('INSERT INTO photos (galleryId, filename) VALUES (?, ?)');
    files.forEach(file => {
        insertPhotos.run(galleryId, file.path);
    });
    insertPhotos.finalize(err => {
        if (err) {
            console.error('Error inserting photos:', err.message);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect(`/gallery/${galleryId}/manage-gallery`);
    });
});

// Route for deleting a picture from a gallery
router.post('/gallery/:galleryId/delete-photo/:photoId', (req, res) => {
    const { galleryId, photoId } = req.params;

    // Step 1: Retrieve the file path of the photo from the database
    db.get('SELECT filename FROM photos WHERE galleryId = ? AND id = ?', [galleryId, photoId], (err, row) => {
        if (err) {
            console.error('Error retrieving photo path:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        const filePath = `../${row.filename}`;

        // Step 2: Delete the photo record from the database
        db.run('DELETE FROM photos WHERE galleryId = ? AND id = ?', [galleryId, photoId], (err) => {
            if (err) {
                console.error('Error deleting photo:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Step 3: Delete the photo file from the server
            fs.unlink(path.join(__dirname, filePath), (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                // Photo and file successfully deleted
                res.redirect(`/gallery/${galleryId}/manage-gallery`);
            });
        });
    });
});

module.exports = router;
