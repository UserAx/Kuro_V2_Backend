require('dotenv').config({path: './config/dev.env'});
const express = require('express');
const app = express();
const cors = require('cors');
// const whitelist = [process.env.CORS_FRONTEND_TEST, process.env.CORS_FRONTEND_PROD];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//         //doesn't equal -1. (if the link does exist in whitelist array, we will get 0 and above value.)
//       callback(null, true);//in that case, return true and allow.
//     } else {
//       callback(new Error('Not allowed by CORS'));//else throw an error.
//     }
//   }
// }

const corsOption = {
    origin: process.env.CORS_FRONTEND_PROD || process.env.CORS_FRONTEND_PROD_2,
    optionsSuccessStatus: 200
}

app.use(cors(corsOption));
const userrouter = require('./src/routers/userrouter');
const messagerouter = require('./src/routers/messagerouter');
const notificationrouter = require('./src/routers/notificationrouter');

app.use(express.json());
app.use(userrouter);
app.use(messagerouter);
app.use(notificationrouter);

app.get('/', (req, res) => {
    res.send({Message: "Application is working correctly"});
});


app.listen(process.env.PORT, () => {
    console.log('Server is up.');
});

//commit number: fourteenth