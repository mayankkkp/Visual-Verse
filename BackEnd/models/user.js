// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     images: [{
//         type: String
//     }]
// }, {
//     collection: 'User'
// });

// module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Trims whitespace
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Converts email to lowercase
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference files in GridFS
        ref: 'Image' // Reference to the 'Image' model (or whatever model you use for images)
    }]
}, {
    collection: 'users', // Collection name in lowercase and pluralized
    timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// Pre-save hook to hash passwords before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
