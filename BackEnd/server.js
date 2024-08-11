const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const path = require('path');
const { GridFSBucket } = require('mongodb');

const app = express();
app.use(bodyParser.json());

const PORT = 5000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/LoginSignUp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB connected');
        // Initialize GridFSBucket after successful connection
        const conn = mongoose.connection;
        app.locals.bucket = new GridFSBucket(conn.db, {
            bucketName: 'images'
        });

        // Start server after initializing GridFS
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.log('MongoDB connection error:', err));

// Include the auth routes
app.use(authRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
