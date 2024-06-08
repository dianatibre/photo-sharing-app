const express = require('express');
const session = require('express-session');
const path = require('path'); // Import the path module
const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key', // Change this to a secure random string
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/authRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use(authRoutes);
app.use('/galleries', galleryRoutes);
app.use('/upload', uploadRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
