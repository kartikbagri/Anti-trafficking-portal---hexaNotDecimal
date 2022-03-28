const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    missingPersonName: {
        type: String
    },
    gender: {
        type: ['M', 'F', 'O']
    },
    age: {
        type: Number
    },
    possibleLocations: {
        type: [{
            type: mongoose.Schema.Types.ObjectId ,
            ref: 'Location'
        }]
    },
    recentImages: {
        type: [{
            type: String
        }]
    },
    aadhaarNumber: {
        type: String
    },
    reporterName: {
        type: String
    },
    reporterPhoneNumber: {
        type: String
    },
    reporterAadhaarNumber: {
        type: String
    },
    reporterAddress: {
        type: String
    },
    fir: {
        type: String
    }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;