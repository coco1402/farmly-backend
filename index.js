// Load environment variables from .env file
require('dotenv').config();

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL
const routes = require('./routes/routes');
const { initializeFirebase } = require('./config/firebase');

// Initialize Firebase Admin SDK for authentication (commented out for testing)
initializeFirebase();

// Connect to MongoDB database
mongoose.connect(mongoString);
const database = mongoose.connection

// Handle database connection errors
database.on('error', (error) => {
    // Database error
})

// Log successful database connection
database.once('connected', () => {
    // Database connected
})

// Create Express application
const app = express();

// Enable CORS for all origins (for development)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Mount all API routes under /api path
app.use('/api', routes)

// Start server on port 3000, listen on all interfaces
app.listen(3000, '0.0.0.0', () => {
    // Server started
})
