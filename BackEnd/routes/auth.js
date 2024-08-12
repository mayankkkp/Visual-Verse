// const express = require('express');
// const router = express.Router();
// const User = require('../models/user');
// const multer = require('multer');
// const path = require('path');
// const crypto = require('crypto');

// // Use memory storage for multer
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router.post('/signup', async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }
//         user = new User({ username, email, password });
//         await user.save();
//         res.status(201).json({ msg: 'User created successfully' });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         let user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }
//         if (user.password !== password) {
//             return res.status(400).json({ msg: 'Invalid credentials' });
//         }
//         res.status(200).json({ username: user.username, msg: 'Login successful' });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// router.post('/upload', upload.single('image'), async (req, res) => {
//     const { username } = req.body;
//     const file = req.file;

//     if (!file) {
//         return res.status(400).json({ msg: 'No file uploaded' });
//     }

//     const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
//     const bucket = req.app.locals.bucket;

//     try {
//         // Upload file to GridFS
//         const uploadStream = bucket.openUploadStream(filename);
//         uploadStream.end(file.buffer);

//         let user = await User.findOne({ username: username.trim() });
//         if (!user) {
//             return res.status(400).json({ msg: 'User not found' });
//         }

//         user.images.push(filename);
//         await user.save();

//         res.status(201).json({ msg: 'Image uploaded successfully', filename });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// // Route to stream image from GridFS
// router.get('/image/:filename', (req, res) => {
//     const { filename } = req.params;
//     const bucket = req.app.locals.bucket;

//     try {
//         const downloadStream = bucket.openDownloadStreamByName(filename);
//         downloadStream.on('data', (chunk) => res.write(chunk));
//         downloadStream.on('end', () => res.end());
//         downloadStream.on('error', () => res.status(404).json({ msg: 'Image not found' }));
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Assuming you have a User model
const router = express.Router();

// Environment variables for secret keys, email, and Google OAuth
const { JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, EMAIL, EMAIL_PASSWORD } = process.env;

// Configure passport for Google OAuth
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName
            });
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

// JWT Token creation
const createToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
};

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });

        const token = createToken(newUser);
        res.status(201).json({ token, user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken(user);
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: EMAIL,
            to: user.email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Google OAuth route
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/',
    session: false
}), (req, res) => {
    const token = createToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is not valid' });
        req.user = user;
        next();
    });
};

// Route to get the current user
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
