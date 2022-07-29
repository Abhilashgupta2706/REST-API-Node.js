console.clear();
console.log('--------------- Concole Cleared ---------------');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed.route');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, Math.random().toString(36).substring(2, 10) + '_' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    };
};

app
    .use(bodyParser.json())
    .use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
    .use('/images', express.static(path.join(__dirname, 'images')));

app
    .use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Specific domain (www.___.__) || ALl domains (*) || Multiple domains (domain1 , domain2 , domain3)
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Only allow the methods you want to domain to use
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    })
    .use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;

    res
        .status(status)
        .json({ message: message });

});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(result => {
        console.log('Connected to MongoDB Atlas Cloud Server!');
        app.listen(PORT, () => {
            console.log(`Your app is now running on http://localhost:${PORT}`)
        });
    })
    .catch(err => {
        console.log(err)
    });
