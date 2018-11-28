module.exports = function (module, appContext) {
    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const User = module.User;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");

    /* Signup User */
    app.post('/signup', (req, res, next) => {
        req.assert('name', 'Name cannot be blank').notEmpty();
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.sanitize('email').normalizeEmail({
            remove_dots: false
        });

        // Check for validation errors    
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
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
                    success: false,
                    message: 'Account with that email is already exist'
                });
            } else {
                user.save();

                var token = jwt.sign({
                    user: user
                }, CONFIG.SECRET, {
                    expiresIn: '7d'
                });

                var token = new Token({
                    _userId: user._id,
                    token: crypto.randomBytes(16).toString('hex')
                });

                // Send the email
                var transporter = nodemailer.createTransport({
                    service: 'Sendgrid',
                    auth: {
                        user: process.env.SENDGRID_USERNAME,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                });
                var mailOptions = {
                    from: 'no-reply@yourwebapplication.com',
                    to: user.email,
                    subject: 'Account Verification Token',
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
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

                /* res.json({
                    success: true,
                    message: 'Token generated!',
                    token: token
                }); */
            }
        });
    });


    /* Login User */
    app.post('/login', (req, res, next) => { // Check for validation errors            
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.assert('password', 'Password must be at least 4 characters long').len(4);
        req.sanitize('email').normalizeEmail({
            remove_dots: false
        });

        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }
        const email = req.body.email,
            password = req.body.password;

        User.findOne({
            email: email
        }, (err, user) => {
            if (err) throw err;

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
                    return res.status(401).send({
                        type: 'not-verified',
                        msg: 'Your account has not been verified.'
                    });
                } else {
                    var token = jwt.sign({
                        user: user
                    }, CONFIG.SECRET, {
                        expiresIn: '7d'
                    });

                    res.json({
                        success: true,
                        message: 'Token Generated!',
                        token
                    });
                }
            }
        });
    });

    app.post('/confirmation', (req, res, next) => {
        req.assert('email', 'Email is not valid').isEmail();
        req.assert('email', 'Email cannot be blank').notEmpty();
        req.assert('token', 'Token cannot be blank').notEmpty();
        req.sanitize('email').normalizeEmail({
            remove_dots: false
        });

        // Check for validation errors    
        var errors = req.validationErrors();
        if (errors) return res.status(400).send(errors);

        // Find a matching token
        Token.findOne({
            token: req.body.token
        }, function (err, token) {
            if (!token) return res.status(400).send({
                type: 'not-verified',
                msg: 'We were unable to find a valid token. Your token my have expired.'
            });

            // If we found a token, find a matching user
            User.findOne({
                _id: token._userId,
                email: req.body.email
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
};