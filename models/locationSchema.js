const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    reason: {
        type: ['LAST-FOUND', 'TRAFFICKER', 'VICTIM']
    }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;