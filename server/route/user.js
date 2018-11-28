module.exports = function (module, appContext) {
    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const User = module.User;
    const checkJWT = require("../util/jwtUtil.js");

    /* Signup User */
    app.post('/signup', (req, res, next) => {
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

                res.json({
                    success: true,
                    message: 'Token generated!',
                    token: token
                });
            }
        });
    });


    /* Login User */
    app.post('/login', (req, res, next) => {
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
};