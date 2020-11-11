require('../database/database');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: '../../config/dev.env'});
const jwtKey = process.env.JWTKEY;
const User = require('../models/user');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace("Bearer ", "");
        const decodedToken = jwt.verify(token, jwtKey);
        const user = await User.findOne({_id: decodedToken._id, 'tokens.token': token});
        if(!user){
            return res.status('404').send("User not found.");
        }
        req.token = token;
        req.user = user;
    }catch(e){
        return res.status('401').send("Unable to Authenticate.");
    }
    next();
};

module.exports = auth;