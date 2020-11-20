const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../config/dev.env' });

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.length < 8) {
                throw new Error("Password too short.")
            } else if (value.toLowerCase().includes("password")) {
                throw new Error("Password should not contain the word: password.")
            }
        }
    },
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        validate(value) {
            if (value.length !== 10) {
                throw new Error("Please provide a valid phone number of 10 digits.");
            }
        }
    },
    age: {
        type: String,
        trim: true
    },
    sex: {
        type: String,
        trim: true,
        lowercase: true
    },
    contacts: [{
        id: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        }
    }],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, { timestamps: true });

UserSchema.virtual('messages', {
    ref: 'message',
    localField: '_id',
    foreignField: 'owner' 
});

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    userObject.hasAvatar = !!userObject.avatar;
    return userObject;
}

UserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWTKEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to find user.");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error("Authorization Denied!");
    }
    return user;
}

const User = mongoose.model('user', UserSchema);

module.exports = User;
