const express = require('express');
const router = express.Router();

// Fake user database (replace with a real database)
const users = [];

// Signup route
router.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create a new user
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    // Set session data to indicate user is logged in
    req.session.user = username;

    // Redirect or send response as needed
    res.redirect('/');
});

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find user in the database
    const user = users.find(user => user.username === username);

    // Check if user exists and password is correct
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Set session data to indicate user is logged in
    req.session.user = username;

    // Redirect or send response as needed
    res.redirect('/');
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
