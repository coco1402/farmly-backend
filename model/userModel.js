const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profile_pic: {
        type: String,
        default: '../assets/user.png'
    },
    postcode: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        enum: ['customer', 'farmer'],
        default: 'customer'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Users', userSchema);