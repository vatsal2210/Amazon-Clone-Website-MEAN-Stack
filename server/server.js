const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const async = require('async');
const nodemon = require('nodemon');
require('dotenv').config();

const config = require('./config');
//console.log(process.env.DB_HOST);
const app = express();

/* Connect Database */
mongoose.connect(config.dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
}, err => {
    if (err) {
        console.log("Database connection Error: " + err);
        return console.log(err);
    } else {
        console.log("Connect to MongoDB");
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(morgan("vatsal"));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', express.static('static'));

app.listen(config.port, err => {
    console.log("Server on port " + config.port);
});

const appContext = {};
appContext.app = app;
appContext.config = config;
appContext.jwt = jwt;
appContext.async = async;

routes = require('./route/module.js')(appContext);