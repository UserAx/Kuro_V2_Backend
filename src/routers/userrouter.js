const router = require('express').Router();
const User = require('../models/user');
require('../database/database');
const auth = require('../auth/auth');
const multer = require('multer');
const sharp = require('sharp');

router.post('/users', async (req, res) => {
    try{
        const user = new User({...req.body});
        await user.save();
        // if(user.phone){
        //     const existingPhone = await User.findOne({phone: user.phone});
        //     if(existingPhone){
        //         await user.remove();
        //         return res.status(400).send({error: "Invalid phone number."});
        //     }
        // }
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
        console.log(e);
    }
});


router.get('/me/contactdetails/id=:contactId', auth, async (req, res) => {
    try{
        const contact = await User.findById(req.params.contactId);
        if(!contact){
            return res.status(404).send();
        }
        const exists = req.user.contacts.find((userContact) => userContact.id === req.params.contactId);
        if(exists){
            const {username, age, gender, phone, name} = contact;
            return res.status(200).send({username, age, gender, phone, name});
        }
        return res.status(400).send();
    }catch(e){
        res.status(500).send(e);
        console.log(e);
    }
});

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token}); 
    }catch(e){
        res.status(400).send(e);
    }
});

router.get('/me', auth, async (req, res) => {
    res.status(200).send(req.user);
});

router.get('/me/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.status(200).send();
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/me/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    }catch(e){
        res.status(500).send(e);
    }
});

router.patch('/me', auth, async (req, res) => {
    const updateAbles = ['password', 'age', 'name', 'sex', 'phone'];
    const updateRequests = Object.keys(req.body);
    const match = updateRequests.every((request) => updateAbles.includes(request));
    if(!match){
        return res.status(400).send();
    }
    if(req.body.phone.length === 10){
        console.log("Runs whtn phonedigit is 10.");
        const existingPhone = await User.findOne({phone: req.body.phone});
        if(existingPhone){
            if(existingPhone._id.toString() !== req.user._id.toString()){
                return res.status(400).send({error: "Invalid phone number."});
            }
        }
    }else {
        delete req.body.phone;
    }
    try{
        updateRequests.map((request) => {
            req.user[request] = req.body[request];
        });
        await req.user.save();
        if(req.user.reject){
            return res.status(400).send({error: "Invalid phone number."});
        }
        res.status(200).send();
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

router.get('/me/users/find=:findContact', auth, async (req, res) => {
    if(!req.params.findContact){
        return res.status(400).send();
    }
    try{
        const users = await User.find();
        const usersObjects = users.map((user) => {
            const hasAvatar = !!user.avatar;
            const {username, id} = user;
            return {username, id, hasAvatar};
        }).filter((user) => user.username.includes(req.params.findContact))
        .filter((user) => user.id.toString() !== req.user._id.toString());
        res.status(200).send(usersObjects);
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

router.get('/me/contacts', auth, async (req, res) => {
    res.status(200).send(req.user.contacts);
});

router.post('/me/contacts', auth, async (req, res) => {
    try{
        const exists = req.user.contacts.find((contact) => contact.id === req.body.contactId);
        if(exists){
            return;
        }
        const user = await User.findById(req.body.contactId);
        if(!user){
            return res.status(404).send();
        }
        req.user.contacts.push({id: user._id, username: user.username});
        await req.user.save();
        user.contacts.push({id: req.user._id, username: req.user.username});
        await user.save();
        res.send(req.user.contacts);
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

router.delete('/me/contacts/:contactId', auth, async (req, res) => {
    try{
        req.user.contacts = req.user.contacts.filter((contact) => contact.id !== req.params.contactId);
        await req.user.save();
        res.send(req.user.contacts);
    }catch(e){
        res.status(400).send(e);
    }
});

router.delete('/me', auth, async (req, res) => {
    try{
        // const email = req.user.email;
        // const name = req.user.username;
        //sendRegards(email, name);
        await req.user.remove();
        res.status(200).send();
    }catch(e){
        res.status(500).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    }, 
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error("Unsupported file type."));
        }
        return cb(undefined, true);
    }
});

router.get(`/users/:id/hasAvatar`, async (req, res) => {
    const user = await User.findOne({_id: req.params.id});
    if(!user){
        return res.status(404).send();
    }
    if(user.avatar){
        return res.status(200).send(true);
    }
    res.status(200).send(false);
});

router.get(`/users/:id/avatar`, async (req, res) => {
    const user = await User.findOne({_id: req.params.id});
    if(!user){
        return res.status(404).send();
    }
    res.set('Content-Type', 'image/png');
    res.status(200).send(user.avatar);
});

router.post('/me/avatar', auth, upload.single('userAvatar'), async (req, res) => {
    try{
        //When serving cropped image.
        //const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250, position: 'top'}).png().toBuffer();
        //For now, just server original image and reduce size on browser.
        const buffer = await sharp(req.file.buffer).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send(e);
    }   
});

router.delete('/me/avatar', auth, async (req, res) => {
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;
