console.clear();
console.log('--------------- Concole Cleared ---------------');

const express = require('express');
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed.route');

const app = express();
const PORT = 8080;

app
    .use(bodyParser.json());

app
    .use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Specific domain (www.___.__) || ALl domains (*) || Multiple domains (domain1 , domain2 , domain3)
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Only allow the methods you want to domain to use
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    })
    .use('/feed', feedRoutes);

app.listen(PORT, () => {
    console.log(`Your app is running on http://localhost:${PORT}`)
});