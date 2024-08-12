// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const authRoutes = require('./routes/auth');
// const path = require('path');
// const cors = require('cors');
// const { GridFSBucket } = require('mongodb');

// const app = express();
// app.use(bodyParser.json());
// app.use(cors({
//   origin: 'http://localhost:3000', 
//   credentials: true
// }));

// const PORT = 5000;

// const url = "mongodb+srv://mANAVV:visualverse0601@visualverse.14ch8.mongodb.net/?retryWrites=true&w=majority&appName=Visualverse";


// mongoose.connect(url)
//     .then(() => {
//         console.log('MongoDB connected');
    
//         const conn = mongoose.connection;
//         app.locals.bucket = new GridFSBucket(conn.db, {
//             bucketName: 'images'
//         });

//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     })
//     .catch(err => console.log('MongoDB connection error:', err));


// app.use(authRoutes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const path = require('path');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

const PORT = 5000;

const url = "mongodb+srv://mANAVV:visualverse0601@visualverse.14ch8.mongodb.net/?retryWrites=true&w=majority&appName=Visualverse";

mongoose.connect(url)
    .then(() => {
        console.log('MongoDB connected');
    
        const conn = mongoose.connection;
        app.locals.bucket = new GridFSBucket(conn.db, {
            bucketName: 'images'
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.log('MongoDB connection error:', err));

app.use(authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
