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

    /* Get All collections except that user */
    app.get('/api/collections', checkJWT, (req, res, next) => {
        console.log('Find all collection details');
        Collection.find({
                visibility: true
            })
            .populate('userId')
            .populate('products.product')
            .exec((err, collection) => {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Something went wrong. Try again!'
                    });
                } else {
                    console.log('Found products ', collection);
                    if (collection) {
                        res.json({
                            success: true,
                            collection
                        });
                    }
                }
            });
    });

    /* Get Collections List by user */
    app.get('/api/usercollection', checkJWT, (req, res, next) => {
        console.log('Find all collection details');

        Collection.find({
                visibility: true,
                userId: req.decoded.user._id
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

    /* Add Product in collection */
    app.post('/api/addCollection', checkJWT, [
            check('title').isLength({
                min: 3
            })
            .withMessage('Must be 3 chars long'),
        ],
        function (req, res, next) {
            console.log('add collection ');
            const title = req.body.title;
            const description = req.body.description;
            const productId = req.body.productId;
            const visibility = req.body.visibility;
            const userId = req.decoded.user._id;

            console.log(title);
            console.log(description);
            console.log(productId);
            console.log(userId);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                return res.json({
                    success: false,
                    message: errors,
                });
            }

            Collection.findOne({
                name: title
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
                        let collection = new Collection();
                        collection.name = title;
                        collection.description = description;
                        collection.userId = userId;
                        collection.visibility = visibility;
                        //collection.products.product = productId;
                        productId.map(data => {
                            console.log(data);
                            collection.products.push({
                                product: data
                            });
                        });

                        collection.save(function (err, item) { // Create User
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

    /* Find collection Product Details */
    app.get('/api/collectionDetails/:id', checkJWT, (req, res, next) => {
        console.log('Find Product Details ', req.params.id);
        Collection.find({
                _id: req.params.id
            },
            function (err, products) {
                if (err) {
                    console.log('err found ', err);
                } else {
                    console.log('Found details of a products ', products);
                    res.send({
                        success: true,
                        products
                    });
                }
            });
    });

    /* Update Collection */
    app.post('/api/updateCollection', checkJWT, [
            check('title').isLength({
                min: 3
            })
            .withMessage('Must be 3 chars long'),
        ],
        function (req, res, next) {
            console.log('update collection ');
            const id = req.body.id;
            const title = req.body.title;
            const description = req.body.description;
            // const productId = req.body.productId;
            const visibility = req.body.visibility;
            //const userId = req.decoded.user._id;

            console.log(productId);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log(errors.array());
                return res.json({
                    success: false,
                    message: errors,
                });
            }

            // Compare name of update collection
            Collection.findOneAndUpdate({
                    _id: id
                }, {
                    $set: {
                        name: title,
                        description: description,
                        visibility: visibility,
                    },
                    // $push: {
                    //     products: productId.map(data => {
                    //         products.push({
                    //             product: data
                    //         });
                    //     })
                    // }
                },
                function (err, product) {
                    if (err) {
                        console.log('err found in update collection ', err);
                        res.send({
                            success: false,
                            message: 'Something went wrong!. ' + err,
                        });
                    } else {
                        res.send({
                            success: true,
                            message: 'Collection Details Updated'
                        });
                    }
                });
        });

    /* Update Collection product Qty */
    app.post('/api/updateCollectionProduct', checkJWT,
        function (req, res, next) {
            console.log('update collection ');
            const id = req.body.id;
            const productId = req.body.productId;
            const status = req.body.status;

            console.log(id);
            console.log(productId);
            console.log(status);

            if (status === 0) {
                console.log('remove product');
                removeCollectionProduct();
            } else {
                console.log('add product');
                addCollectionProduct();
            }

            function removeCollectionProduct() {
                Collection.findOneAndUpdate({
                        _id: id
                    }, {
                        $pull: {
                            "products": {
                                product: productId
                            }
                        },
                    },
                    function (err, product) {
                        if (err) {
                            console.log('err found in update collection ', err);
                            res.send({
                                success: false,
                                message: 'Something went wrong!. ' + err,
                            });
                        } else {
                            res.send({
                                success: true,
                                message: 'Collection Details Updated'
                            });
                        }
                    });
            }

            function addCollectionProduct() {
                Collection.findOneAndUpdate({
                        _id: id
                    }, {
                        $push: {
                            "products": {
                                product: productId
                            }
                        }
                    },
                    function (err, product) {
                        if (err) {
                            console.log('err found in update collection ', err);
                            res.send({
                                success: false,
                                message: 'Something went wrong!. ' + err,
                            });
                        } else {
                            res.send({
                                success: true,
                                message: 'Collection Details Updated'
                            });
                        }
                    });
            }
        });

    /* Delete Collection */
    app.post('/api/deleteCollection', checkJWT, function (req, res) {
        console.log('Delete Item', req.body.id);
        Collection.findOneAndDelete({
            _id: req.body.id
        }, function (err, data) {
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    message: 'Something went wrong. Try Again! ' + err,
                });
            }
            console.log('delete item ', data);
            res.send({
                success: true,
                message: 'Deleted successfully.'
            });
        });
    });
};