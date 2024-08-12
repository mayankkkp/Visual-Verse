const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }]
}, {
    collection: 'User'
});

module.exports = mongoose.model('User', UserSchema);