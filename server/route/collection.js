module.exports = function (module, appContext) {

    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const Collection = module.Collection;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");
    const {
        check,
        validationResult
    } = require('express-validator/check');
    const nodemailer = require('nodemailer');
    const crypto = require('crypto');
    const async = appContext.async;

    /* Get Product List */
    app.get('/api/findColleciton', checkJWT, (req, res, next) => {
        console.log('Find all collection details');

        Collection.find({
                visibility: true
            },
            function (err, collection) {
                if (err) {
                    console.log('err found ', err);
                } else {
                    console.log('Found collection details ', collection);
                    res.send({
                        success: true,
                        collection
                    });
                }
            });
    });

    app.post('/api/addCollection', checkJWT, [
            check('name').isLength({
                min: 3
            })
            .withMessage('Must be 3 chars long'),
        ],
        function (req, res, next) {
            console.log('add collection');
            const collections = req.body.collection;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                return res.json({
                    success: false,
                    message: errors,
                });
            }

            Collection.findOne({
                name: collections.title
            }, function (err, data) {
                if (err) {
                    console.log('find item name found error ', err);
                    res.send({
                        success: false,
                        message: err,
                    });
                } else {
                    if (data != 'undefined' && data != null) {
                        console.log('Name already exist');
                        res.send({
                            success: false,
                            message: 'Something went wrong. Try Again!',
                        });
                    } else {
                        console.log(collections);
                        let collection = new Collection();
                        collection.title = collections.name;
                        collection.description = collections.description;
                        collection.userId = collections.userId;
                        data.map(data => {
                            Collection.collections.push({
                                product: data.product,
                                quantity: data.quantity
                            });
                        });

                        Collection.save(function (err, item) { // Create User
                            if (err) {
                                console.log(err);
                                res.send({
                                    success: false,
                                    message: 'Something went wrong. Try Again! ' + err,
                                });
                            } else {
                                res.send({
                                    success: true,
                                    message: req.body.title + ' added Successfully!',
                                });
                            }
                        });
                    }
                }
            });

        });
};