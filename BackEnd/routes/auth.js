const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ msg: 'User created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        if (user.password !== password) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        res.status(200).json({ username: user.username, msg: 'Login successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    const { username } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
    const bucket = req.app.locals.bucket;

    try {
        // Upload file to GridFS
        const uploadStream = bucket.openUploadStream(filename);
        uploadStream.end(file.buffer);

        let user = await User.findOne({ username: username.trim() });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        user.images.push(filename);
        await user.save();

        res.status(201).json({ msg: 'Image uploaded successfully', filename });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to stream image from GridFS
router.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    const bucket = req.app.locals.bucket;

    try {
        const downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.on('data', (chunk) => res.write(chunk));
        downloadStream.on('end', () => res.end());
        downloadStream.on('error', () => res.status(404).json({ msg: 'Image not found' }));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
