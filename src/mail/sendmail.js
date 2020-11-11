const sendmail = require('@sendgrid/mail');
require('dotenv').config({path: '../../config/dev.env'});
const sendmailKey = process.env.SENDMAILKEY;

sendmail.setApiKey(sendmailKey);

const sendWelcome = (email, name) => {
    sendmail.send({
        to: email,
        from: "kuro.messenger@gmail.com",
        subject: "Welcome",
        text: "Good to see you join our community. On Kuro, you can talk with your friends and loved ones with ease."
    });
}

const sendRegards = (email, name) => {
    sendmail.send({
        to: email,
        from: "kuro.messenger@gmail.com",
        subject: "So sad to see you go.",
        text: "We are very sad to see you leave our community. Please feel free to leave us a feedback."
    });
}

module.exports = {sendWelcome, sendRegards};