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
    app.post('/signup', [
        check('name').isLength({
            min: 3
        }).trim().escape().withMessage('Name Must be at least 3 chars long'),
        check('email').isEmail().normalizeEmail().withMessage('Enter Valid Email Id'),
        check('password').isLength({
            min: 3
        })
        .withMessage('Password Must be at least 3 chars long'),
        check('isSeller').isNumeric().custom(tax => {
            console.log(tax)
            if (tax == 0 || tax == 1) {
                return true;
            } else {
                return false;
            }
        }).withMessage('Select seller mode')
    ], (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.json({
                code: 400,
                msg: errors.array()
            });
        }

        const name = req.body.name,
            email = req.body.email,
            password = req.body.password,
            isSeller = req.body.isSeller;

        let user = new User();
        user.name = name;
        user.email = email;
        user.password = password;
        user.picture = user.gravatar();
        user.isSeller = isSeller;

        User.findOne({
            email: req.body.email
        }, (err, existingUser) => {
            if (existingUser) {
                res.json({
                    code: 400,
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
                        // user: process.env.SENDGRID_USERNAME,
                        // pass: process.env.SENDGRID_PASSWORD
                        user: 'mentorpowersoftware@gmail.com',
                        pass: 'Mentor@123'
                    }
                });
                var mailOptions = {
                    from: 'no-reply@yourwebapplication.com',
                    to: user.email,
                    subject: 'Account Verification Token',
                    //text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + validationToken.token + '.\n'
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + validationToken.token + '.\n'
                };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        return res.status(500).send({
                            msg: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'A verification email has been sent to ' + user.email + '.',
                        token: token
                    });
                    //res.status(200).send('A verification email has been sent to ' + user.email + '.');
                });
            }
        });
    });


    /* Login User */
    app.post('/login', [
        check('email').isEmail().normalizeEmail().withMessage('Enter Valid Email Id'),
        check('password').isLength({
            min: 3
        })
        .withMessage('Password Must be at least 3 chars long'),
    ], (req, res, next) => {
        console.log('Login Request ', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.json({
                code: 400,
                msg: errors.array()
            });
        }

        const email = req.body.email,
            password = req.body.password;

        User.findOne({
            email: email
        }, (err, user) => {
            if (err) throw err;

            if (!user) {
                res.json({
                    code: 400,
                    message: 'User not found'
                });
            } else if (user) {
                var validPassword = user.comparePassword(password);

                if (!validPassword) {
                    res.json({
                        code: 400,
                        message: 'Wrong password'
                    });
                } else if (!user.isVerified) {
                    return res.status(401).send({
                        type: 'not-verified',
                        msg: 'Your account has not been verified.'
                    });
                } else if (!user.isActive) {
                    return res.status(401).send({
                        type: 'not-verified',
                        msg: 'Your account has deactived. Please contact Store Manager.'
                    });
                } else {
                    var token = jwt.sign({
                        user: user
                    }, config.secret, {
                        expiresIn: '7d'
                    });

                    res.json({
                        code: 200,
                        message: 'Token Generated!',
                        token: token
                    });
                }
            }
        });
    });

    app.get('/confirmation/:token', (req, res, next) => {
        console.log('In confirmation token ', req.params.token);
        // Find a matching token
        Token.findOne({
            token: req.params.token
        }, function (err, token) {
            if (!token) return res.status(400).send({
                type: 'not-verified',
                msg: 'We were unable to find a valid token. Your token my have expired.'
            });

            // If we found a token, find a matching user
            User.findOne({
                _id: token.userId
            }, function (err, user) {
                if (!user) return res.status(400).send({
                    msg: 'We were unable to find a user for this token.'
                });
                if (user.isVerified) return res.status(400).send({
                    type: 'already-verified',
                    msg: 'This user has already been verified.'
                });

                // Verify and save the user
                user.isVerified = true;
                user.save(function (err) {
                    if (err) {
                        return res.status(500).send({
                            msg: err.message
                        });
                    }
                    res.status(200).send("The account has been verified. Please log in.");
                });
            });
        });
    });

    app.get('/resendToken', (req, res, next) => {
        console.log('Resend verification token');

        

    });
};