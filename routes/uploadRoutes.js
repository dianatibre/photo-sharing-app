const express = require('express');
const router = express.Router();

// Placeholder storage for uploaded files (replace with actual storage solution)
const uploadedFiles = [];

// Display upload form
router.get('/', (req, res) => {
    res.sendFile(__dirname + '/upload.html');
});

// Handle file upload
router.post('/', (req, res) => {
    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'No files were uploaded' });
    }

    // Assuming a single file upload
    const uploadedFile = req.files.file;

    // Placeholder logic to save the uploaded file (replace with actual storage solution)
    uploadedFiles.push(uploadedFile);

    // Redirect or send response as needed
    res.status(200).json({ message: 'File uploaded successfully' });
});

module.exports = router;
