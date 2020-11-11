const mongoose = require('mongoose');
const validator = require('validator');

// const arrayLimitValidator = (val) => {
//     return val.length >= 2;
// }

const MessageSchema = mongoose.Schema({
    message: {
        type: String
    },
    // interlocutors: {
    //     type: [
    //     {
    //             type: String
    //     },   
    // ],
    // validate: [arrayLimitValidator, '{PATH} must be greater than 1.']
    // },
    attachment: {
        title: {
            type: String,
            trim: true,
            lowercase: true
        },
        attached: {
            type: Buffer
        }
    },
    seen: {
        type: Boolean,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    receivers: {
        type: [
        {
            type: mongoose.Schema.Types.ObjectId,
        }
    ],
    required: true
}//receiver object field that has type of array which has each value of type ObjectId.  
}, { timestamps: true });

MessageSchema.statics.findMessages = async (senderId, receiverId) => {
    const messages = await Message.find({sender: senderId});
    if(!messages){
        return ;
    }
    return messages.filter((message) => message.receivers.includes(receiverId));
}

const Message = mongoose.model("message", MessageSchema);

module.exports = Message ;