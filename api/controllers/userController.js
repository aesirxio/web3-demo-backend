// userController.js
const fs = require("fs");

// Import models
const User      = require("../models/userModel");
const mime      = require('mime-types');
let dirAvatar   = '/avatar/';

exports.add = async (req, res) => {
    if (!fs.existsSync('.' + dirAvatar)){
        fs.mkdirSync('.' + dirAvatar);
    }

    let avatar = dirAvatar + 'aesirx.jpeg';

    if (req.file) {
        let ext = mime.extension(req.file.mimetype);
        let avatarName = req.body.id.replace(/\s/g, '_') + '_' + Date.now() + '.' + ext;

        fs.writeFile('.' + dirAvatar + avatarName, req.file.buffer, (err) => {
            if (err) throw err;
        });

        avatar =  dirAvatar + avatarName;
    }

    try {
        await User.create({
            id: req.body.id.replace(/^@[a-z\d_]{3,20}$/i),
            user_name: req.body.user_name,
            ccd_account: req.body.ccd_account,
            avatar: avatar,
        });
        res.status(201);
        res.json({ success: true });
    } catch(error)
    {
        throw new Error(error);
    }
};

exports.update = async (req, res) => {
    User.findOne({ id: req.body.id }, async (err, user) => {
        if (err) {
            res.status(500).end();
            return;
        }

        if (user === null) {
            res.status(404).end();
            return;
        }

        let oldAvatar = user.avatar;
        let ext = mime.extension(req.file.mimetype);
        let avatarName = req.body.id.replace(/\s/g, '_') + '_' + Date.now() + '.' + ext;

        if (fs.existsSync('.' + oldAvatar)){
            await fs.unlinkSync('.' + oldAvatar);
        }

        fs.writeFile('.' + dirAvatar + avatarName, req.file.buffer, (err) => {
            if (err) throw err;
        });

        try {
            await User.updateOne({ id: req.body.id },{
                avatar: dirAvatar + avatarName,
            });
            res.status(200);
            res.json({ success: true });
        } catch(error)
        {
            throw new Error(error);
        }
    });
};

exports.list = async (req, res) => {

    User.findOne({ id: req.params.id }, async (err, user) => {
        if (err) {
            res.status(500).end();
            return;
        }

        if (user === null) {
            res.status(404).end();
            return;
        }

        res.json({user}

        );
    });
};