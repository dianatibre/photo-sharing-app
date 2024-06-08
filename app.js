// app.js

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const db = require('./db');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key', // Change this to a secure random string
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define a route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Initialize database
require('./db');

// // Middleware to parse JSON requests
// app.use(express.json());

// Get all galleries
app.get('/galleries', (req, res) => {
    db.all('SELECT * FROM galleries', (err, galleries) => {
        if (err) {
            console.error('Error fetching galleries:', err.message);
            res.status(500).send('Internal server error');
        } else {
            res.json(galleries);
        }
    });
});

// Create a new gallery
app.post('/galleries', (req, res) => {
    const { title, description, accessLink } = req.body;
    db.run('INSERT INTO galleries (title, description, accessLink) VALUES (?, ?, ?)', [title, description, accessLink], function(err) {
        if (err) {
            console.error('Error creating gallery:', err.message);
            res.status(500).send('Internal server error');
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// Get photos by gallery ID
app.get('/galleries/:galleryId/photos', (req, res) => {
    const { galleryId } = req.params;
    db.all('SELECT * FROM photos WHERE galleryId = ?', [galleryId], (err, photos) => {
        if (err) {
            console.error('Error fetching photos:', err.message);
            res.status(500).send('Internal server error');
        } else {
            res.json(photos);
        }
    });
});

// Add a photo to a gallery
app.post('/galleries/:galleryId/photos', (req, res) => {
    const { galleryId } = req.params;
    const { title, description, filename } = req.body;
    db.run('INSERT INTO photos (galleryId, title, description, filename) VALUES (?, ?, ?, ?)', [galleryId, title, description, filename], function(err) {
        if (err) {
            console.error('Error adding photo:', err.message);
            res.status(500).send('Internal server error');
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// Delete a photo by ID
app.delete('/photos/:photoId', (req, res) => {
    const { photoId } = req.params;
    db.run('DELETE FROM photos WHERE id = ?', [photoId], function(err) {
        if (err) {
            console.error('Error deleting photo:', err.message);
            res.status(500).send('Internal server error');
        } else {
            res.send('Photo deleted successfully');
        }
    });
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files

// Add a photo to a gallery with file upload
app.post('/galleries/:galleryId/photos', upload.single('photo'), (req, res) => {
    const { galleryId } = req.params;
    const { title, description } = req.body;
    const filename = req.file.filename; // Filename of the uploaded photo
    // Save filename to database and handle photo storage as needed
    db.run('INSERT INTO photos (galleryId, title, description, filename) VALUES (?, ?, ?, ?)', [galleryId, title, description, filename], function(err) {
        if (err) {
            console.error('Error adding photo:', err.message);
            res.status(500).send('Internal server error');
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// Fake user database (replace with a real database)
const users = [];

// Signup route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    req.session.user = username;
    res.redirect('/');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

// Other routes...

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/upload', (req, res) => {
    if (req.session.user) {
        // User is logged in, allow access to the upload page
        res.sendFile(__dirname + '/upload.html');
    } else {
        // User is not logged in, redirect to login page
        res.redirect('/login');
    }
});