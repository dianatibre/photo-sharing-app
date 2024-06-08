const express = require('express');
const router = express.Router();

// Placeholder storage for galleries (replace with actual storage solution)
const galleries = [];

// List all galleries
router.get('/', (req, res) => {
    res.json(galleries);
});

// Create a new gallery
router.post('/', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Gallery name is required' });
    }

    // Create a new gallery object and add it to the galleries array
    const newGallery = { id: galleries.length + 1, name };
    galleries.push(newGallery);

    // Redirect or send response as needed
    res.status(201).json({ message: 'Gallery created successfully', gallery: newGallery });
});

// View gallery details by ID
router.get('/:id', (req, res) => {
    const galleryId = parseInt(req.params.id);
    const gallery = galleries.find(gallery => gallery.id === galleryId);
    if (!gallery) {
        return res.status(404).json({ error: 'Gallery not found' });
    }
    res.json(gallery);
});

module.exports = router;
