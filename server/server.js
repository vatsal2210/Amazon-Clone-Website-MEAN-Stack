const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const config = require('./config');
const async = require('async');

const app = express();

/* Connect Database */
mongoose.connect(config.dbUrl, err => {
    if (err) {
        console.log("Database connection Error: " + err);
        return console.log(err);
    } else {
        console.log("Connect to MongoDB");
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(morgan("vatsal"));
app.use(cors());

app.use('/', express.static('static'));

app.get('/', function (req, res) {
    res.send('Hello World');
});

app.listen(config.port, err => {
    console.log("Server on port " + config.port);
});

const appContext = {};
appContext.app = app;
appContext.config = config;
appContext.jwt = jwt;
appContext.async = async;

routes = require('./route/module.js')(appContext);