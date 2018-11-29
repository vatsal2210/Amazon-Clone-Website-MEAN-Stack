module.exports = function (module, appContext) {
    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const User = module.User;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");
    const {
        check,
        validationResult
    } = require('express-validator/check');
    const nodemailer = require('nodemailer');
    const crypto = require('crypto');

    /* User Dashboard */
    app.get('/api/profile', checkJWT, (req, res, next) => {
        console.log('Profile Page body', req.body);
        console.log('Profile Page data ', req.decoded.user._id);
        User.findOne({
            _id: req.decoded.user._id
        }, (err, user) => {
            if (err) {
                console.log('User details not found');
                res.json({
                    success: false,
                    message: 'Something went wrong. Try again!'
                });
            }
            console.log('In API profile user details found ', user);
            res.json({
                success: true,
                user,
                message: "successful"
            });
        });
    });

    /* Store Manager Dashboard */
    app.get('/admin', (req, res, next) => {
        console.log('admin Page');
        res.send('admin page');

        User.find((err, result) => {
            console.log('User details found ', result);
            if (err) {
                console.log('Admin: User found Error ', error);
                res.send({
                    code: 400,
                    msg: 'Something went wrong. Try again!'
                });
                res.send({
                    code: 200,
                    msg: result
                });
            }
        });
    });
};