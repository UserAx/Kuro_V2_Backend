require('../database/database');
const Message = require('../models/message');
const router = require('express').Router();
const auth = require('../auth/auth');
const multer = require('multer');
const {extractor, renameExt} = require('../utils/fileExtensionUtils');
const sharp = require('sharp');
const filterByDate = require('../utils/filterByDateAndText');

const upload = multer({
    limits: {
        fileSize: 20000480
    },
    fileFilter(req, file, cb) {
        // const fileName = file.originalname.split('.');//use regexp to search from backwards
        // req.fileExtension = fileExtension[1];
        // req.fileTitle = fileName[0];
        req.fileName= file.originalname;
        if(!file.originalname.match(/\.(doc|docx|pdf|png|jpeg|jpg)$/)){
            return cb(new Error("Unsupported."));
        }
        cb(undefined, true);
    }  
});

router.get('/messages/:contactId/messageAlert', auth, async (req, res) => {
    try{
        const messages = await Message.findMessages(req.params.contactId, req.user._id);
        if(messages.length === 0){
            return res.status(404).send();
        }
        const {seen} = filterByDate(messages)[0];
        res.status(200).send({seen});
    }catch(e){
        console.log(e);
        res.status(500).send(e);
    }
});

router.get('/messages/:contactId/:messageId/attachment', auth, async (req, res) => {
    try{
        const message = await Message.findOne({_id: req.params.messageId});
        if(!message || !message.attachment.attached){
            return res.status(404).send();
        }
        if(!message.sender === req.user._id && !message.receivers.includes(req.params.contactId)){
            return res.status(401).send();
        }
        const extension = extractor(message.attachment.title);
        switch (extension){
            case "png":
            return res.set("Content-Type", "image/png").send(message.attachment.attached);
            case "docx":
            return res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            .send(message.attachment.attached);
            case "doc": 
            return res.set("Content-Type", "application/msword").send(message.attachment.attached);
            case "pdf": 
            return res.set("Content-Type", "application/pdf").send(message.attachment.attached);
            default: res.status(500).send();
        }
    }catch(e){
        console.log(e);
        res.status(500).send();
    }
});

router.post('/messages/:id/attachment', auth, upload.single('messageAttachment') ,async(req, res) => {
    try{
        const message = await Message.findById(req.params.id);
        const extension = extractor(req.fileName);
        if(extension.match(/(jpeg|jpg)/)){
            const title = renameExt(req.fileName, 'png');
            const attached = await sharp(req.file.buffer).png().toBuffer();
            message.attachment = {title, attached};
        }else {
            message.attachment = {title: req.fileName, attached: req.file.buffer};
        }
        await message.save();
        res.status(201).send(message);
    }catch(e){
        console.log(e);
        res.status(500).send();
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.get('/messages/:contactId', auth, async(req, res) => {
    try{
        const receivedMessages = await Message.findMessages(req.params.contactId, req.user._id);
        const sentMessages = await Message.findMessages(req.user._id, req.params.contactId);
        //Since I have to match the receiver as well above one is more useful.
        //await req.user.populate({path: 'messages'}).execPopulate();
        const messages = sentMessages.concat(receivedMessages);
        if(receivedMessages.length > 0){
            const {seen, _id} = filterByDate(receivedMessages)[0];
            if(!seen){
                const message = await Message.findById(_id);
                message.seen = true;
                await message.save();
            }
        }
        res.status(200).send(messages);
    }catch(e){
        console.log(e);
        res.status(400).send();
    }
});

router.post('/messages', auth, async(req, res) => {
    try{
        const message = new Message({...req.body, sender: req.user._id});
        await message.save();
        res.status(201).send(message);
    }catch(e){
        console.log(e);
        res.status(400).send();
    }
});

router.delete('/messages/:id', auth, async(req, res) => {
    try{
        const message = await Message.findOne({sender: req.user._id, _id: req.params.id});
        if(!message){
            return res.status(404).send();
        }
        message.message = "Message was deleted."
        message.attachment = undefined;
        await message.save();
        res.status(200).send(message);
    }catch(e){
        res.status(500).send();
    }
});


module.exports = router;