require('../database/database');
const router = require('express').Router();
const Notification = require('../models/notification');
const auth = require('../auth/auth');
const User = require('../models/user');

router.get('/me/notifications', auth, async (req, res) => {
    try{
        const notifications = await Notification.find({receiverId: req.user._id});
        res.status(200).send(notifications);
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

router.post('/me/notifications', auth, async (req, res) => {
    const exists = await Notification.find({receiverId: req.body.receiverId, senderId: req.user._id});
    try{
        if(exists.length > 0){
            return res.status(200).send();
        }
        const notification = new Notification({...req.body, sender: req.user.username, senderId: req.user._id});
        await notification.save();
        res.status(200).send(notification);
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

router.delete('/me/notifications/:notificationId', auth, async (req, res) => {
    try{
        const notification = await Notification.findById(req.params.notificationId);
        if(!notification){
            return res.status(404).send();
        }
        await notification.remove();
        res.status(200).send(req.params.notificationId);
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

module.exports = router;