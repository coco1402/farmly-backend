const mongoose = require('mongoose');

//creating a new folder in the database
const farmSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    address: {
        required: true,
        type: Object
    },
    description: {
        required: true,
        type: String
    },
    profile_pic: {
        required: true,
        type: String
    },
    username: {
        required: true,
        type: String
    },
    user_id: {
        type: String,
        default: "0"
    },
    distance_from_location: {
        type: Number,
        default: 0
    },
    rating: {
        type: Array,
        default: []
    },
    produce: {
        type: Array,
        default: []
    },
})

module.exports = mongoose.model('Farms', farmSchema)