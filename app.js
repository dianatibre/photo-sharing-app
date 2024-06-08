const express = require('express');
const session = require('express-session');
const db = require('./db'); // Import the SQLite database connection
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
        res.redirect('/galleries'); // Redirect to galleries page after successful login
    });
});

// Galleries route
app.get('/galleries', (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login page if user is not logged in
    }

    // Render galleries page with list of galleries
    res.render('galleries', { username: req.session.user });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
