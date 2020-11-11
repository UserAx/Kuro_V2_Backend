const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    requestType: {
        type: String,
        required: true,
        trim: true
    },
    sender: {        
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
},
{timestamps: true});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;