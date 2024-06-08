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

// Login route
app.post('/login', (req, res) => {
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

// Route for rendering the page with galleries
app.get('/manage-galleries', (req, res) => {
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
app.post('/create-gallery', (req, res) => {
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

// Function to format date as "DD/MM/YYYY"
function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Route to get details of a specific gallery by ID
app.get('/gallery/:id', (req, res) => {
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

// Route for updating a specific gallery
app.post('/gallery/:id', (req, res) => {
    // Logic to update the gallery details in the database based on ID
    // Redirect back to the gallery management page or main management page
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
