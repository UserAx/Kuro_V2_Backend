require('dotenv').config({path: './../../config/dev.env'});
const mongoose = require('mongoose');
const mongoURL = process.env.MONGOURL;

mongoose.connect(mongoURL, {useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true});