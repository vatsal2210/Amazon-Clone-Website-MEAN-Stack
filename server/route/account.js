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


    /* Signup User */
    app.post('/api/signup', [
        check('name').isLength({
            min: 3
        }).trim().escape().withMessage('Name Must be at least 3 chars long'),
        check('email').isEmail().normalizeEmail().withMessage('Enter Valid Email Id'),
        check('password').isLength({
            min: 3
        })
        .withMessage('Password Must be at least 3 chars long'),
    ], (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.json({
                success: false,
                message: errors.array()
            });
        }

        const name = req.body.name,
            email = req.body.email,
            password = req.body.password;

        let user = new User();
        user.name = name;
        user.email = email;
        user.password = password;
        user.picture = user.gravatar();

        User.findOne({
            email: req.body.email
        }, (err, existingUser) => {
            if (existingUser) {
                res.json({
                    success: false,
                    message: 'Account with that email is already exist'
                });
            } else {
                user.save();

                var token = jwt.sign({
                    user: user
                }, config.secret, {
                    expiresIn: '7d'
                });

                let validationToken = new Token();
                validationToken.userId = user._id;
                validationToken.token = crypto.randomBytes(16).toString('hex');
                console.log(validationToken);
                validationToken.save();

                // Send the email
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'mentorpowersoftware@gmail.com',
                        pass: 'Mentor@123'
                    }
                });
                var mailOptions = {
                    from: 'no-reply@yourwebapplication.com',
                    to: user.email,
                    subject: 'Account Verification Token',
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api\/confirmation\/' + validationToken.token + '.\n'
                };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err.message
                        });
                    }
                    res.json({
                        success: true,
                        message: 'A verification email has been sent to ' + user.email + '.',
                        token: token
                    });
                });
            }
        });
    });

    /* Login User */
    app.post('/api/login', [
        check('email').isEmail().normalizeEmail().withMessage('Enter Valid Email Id'),
        check('password').isLength({
            min: 3
        })
        .withMessage('Password Must be at least 3 chars long'),
    ], (req, res, next) => {
        console.log('Login Request ', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Login Validation error ', errors.array());
            return res.json({
                success: false,
                message: errors.array()
            });
        }

        const email = req.body.email,
            password = req.body.password;

        User.findOne({
            email: email
        }, (err, user) => {
            if (err)
                res.json({
                    success: false,
                    message: err
                });
            if (!user) {
                res.json({
                    success: false,
                    message: 'User not found'
                });
            } else if (user) {
                var validPassword = user.comparePassword(password);

                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Wrong password'
                    });
                } else if (!user.isVerified) {
                    const userId = user._id;
                    const token = crypto.randomBytes(16).toString('hex');
                    var jwtToken = jwt.sign({
                        user: user
                    }, config.secret, {
                        expiresIn: '7d'
                    });

                    Token.findOne({
                        userId: userId
                    }, function (err, data) {
                        if (err) {
                            console.log('Find User in Token DB error ', err);
                        } else {
                            console.log(data);
                            if (data == null || data == undefined) {
                                let validationToken = new Token();
                                validationToken.userId = userId;
                                validationToken.token = crypto.randomBytes(16).toString('hex');
                                console.log(validationToken);
                                validationToken.save();

                                // Send the email
                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'mentorpowersoftware@gmail.com',
                                        pass: 'Mentor@123'
                                    }
                                });
                                var mailOptions = {
                                    from: 'no-reply@yourwebapplication.com',
                                    to: user.email,
                                    subject: 'Account Verification Token',
                                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api\/confirmation\/' + validationToken.token + '.\n'
                                };
                                transporter.sendMail(mailOptions, function (err) {
                                    if (err) {
                                        return res.json({
                                            success: false,
                                            message: err.message
                                        });
                                    }
                                    res.json({
                                        success: true,
                                        message: 'A verification email has been sent to ' + user.email + '.',
                                        token: jwtToken
                                    });
                                });
                            } else {
                                console.log('update token');
                                //update token and send email.
                                Token.updateOne({
                                    userId: userId
                                }, {
                                    $set: {
                                        token: token
                                    }
                                }, function (err, res1) {
                                    if (err) {
                                        console.log('err found in resend token ', err);
                                        res.json({
                                            success: false,
                                            message: err
                                        });
                                    } else {
                                        console.log('Sending an email');
                                        // Send the email
                                        var transporter = nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                user: 'mentorpowersoftware@gmail.com',
                                                pass: 'Mentor@123'
                                            }
                                        });
                                        var mailOptions = {
                                            from: 'no-reply@yourwebapplication.com',
                                            to: user.email,
                                            subject: 'Account Verification Token',
                                            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api\/confirmation\/' + token + '.\n'
                                        };
                                        transporter.sendMail(mailOptions, function (err) {
                                            if (err) {
                                                return res.json({
                                                    success: false,
                                                    message: err.message
                                                });
                                            }

                                            res.json({
                                                success: false,
                                                message: 'Your account has not been verified. A verification email has been sent to ' + user.email + '.',
                                                token: jwtToken
                                            });
                                        });
                                    }
                                });
                            }
                        }
                    });
                } else if (!user.isActive) {
                    return res.json({
                        success: false,
                        message: 'Your account has deactived. Please contact Store Manager.'
                    });
                } else {
                    var token = jwt.sign({
                        user: user
                    }, config.secret, {
                        expiresIn: '7d'
                    });

                    let message = user.isManager ? 'Token Generated for Admin!' : 'Token Generated for User!';
                    console.log(message);
                    res.json({
                        success: true,
                        message: message,
                        user,
                        token
                    });
                }
            }
        });
    });

    /* Token Confirmaiton */
    app.get('/api/confirmation/:token', (req, res, next) => {
        console.log('In confirmation token ', req.params.token);
        // Find a matching token
        Token.findOne({
            token: req.params.token
        }, function (err, token) {
            if (!token)
                return res.json({
                    success: false,
                    message: 'We were unable to find a valid token. Your token my have expired.'
                });

            // If we found a token, find a matching user
            User.findOne({
                _id: token.userId
            }, function (err, user) {
                if (!user) return res.json({
                    success: false,
                    message: 'We were unable to find a user for this token.'
                });
                if (user.isVerified)
                    return res.json({
                        success: false,
                        message: 'This user has already been verified.'
                    });

                // Verify and save the user
                user.isVerified = true;
                user.save(function (err) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: err.message
                        });
                    }
                    res.status(200).send("The account has been verified. Please log in.");
                });
            });
        });
    });

    /* Resend verification Email */
    app.get('/api/resendToken', (req, res, next) => {
        console.log('Resend verification token');

        /* 
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({
            remove_dots: false
        });

        // Check for validation errors    
        var errors = req.validationErrors();
        if (errors) return res.status(400).send(errors);

        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (!user) return res.status(400).send({
                message: 'We were unable to find a user with that email.'
            });
            if (user.isVerified) return res.status(400).send({
                message: 'This account has already been verified. Please log in.'
            });

            // Create a verification token, save it, and send email
            var token = new Token({
                _userId: user._id,
                token: crypto.randomBytes(16).toString('hex')
            });

            // Save the token
            token.save(function (err) {
                if (err) {
                    return res.status(500).send({
                        message: err.message
                    });
                }

                // Send the email
                var transporter = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });
                var mailOptions = {
                    from: 'no-reply@codemoto.io',
                    to: user.email,
                    subject: 'Account Verification Token',
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
                };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.status(500).send({
                            message: err.message
                        });
                    }
                    res.status(200).send('A verification email has been sent to ' + user.email + '.');
                });
            });

        });
        */
    });
};