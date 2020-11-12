require('dotenv').config({path: './config/dev.env'});
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
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