module.exports = function (module, appContext) {
    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const Product = module.Product;
    const Review = module.Review;
    const User = module.User;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");
    const {
        check,
        validationResult
    } = require('express-validator/check');
    const nodemailer = require('nodemailer');
    const crypto = require('crypto');
    const uniqid = require('uniqid');

    var multer = require("multer");

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '../static/img');
        },
        filename: function (req, file, cb) {
            fileId = uniqid();
            var datetimestamp = Date.now();
            cb(null, fileId + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    });

    /* Get All Product */
    app.get('/admin/getProducts', checkJWT, (req, res, next) => {
        console.log('Admin Get Product List');
        Product.find({})
            .populate('reviews')
            .deepPopulate('reviews.owner')
            .exec((err, products) => {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    });
                } else {
                    if (products) {
                        res.json({
                            success: true,
                            message: '',
                            products
                        });
                    }
                }
            });
    });

    /* Add & Update Product */
    app.post('/admin/product', checkJWT, [
        check('title').isLength({
            min: 3
        })
        .withMessage('Must be at least 3 chars long'),
        check('price').isLength({
            min: 3
        }).isNumeric().withMessage('Only Numeric number is allowed for price.'),
        check('quantity').isLength({
            min: 1
        }).isNumeric(),
        check('tax').isNumeric().custom(tax => {
            console.log(tax);
            if (tax == 0 || tax == 13) {
                return true;
            } else {
                return false;
            }
        }).withMessage('Enter valid tax rate 0% or 13%')
    ], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.json({
                success: false,
                message: errors.array(),
            });
        }

        console.log(req.body.id);
        //console.log('file', JSON.stringify(req.body.file));

        // var upload = multer({ //multer settings
        //     storage: storage
        // }).single('file');

        // upload(req, res, function (err) {
        //     console.log(req.file);
        //     if (err) {
        //         console.log('File upload error ', err);
        //         return;
        //     }
        //     console.log('file uploaded ', res);
        // });

        let product = new Product();
        product.title = req.body.title;
        product.price = req.body.price;
        product.quantity = req.body.quantity;
        product.description = req.body.description;
        product.image = product._id + ".png";
        product.tax = req.body.tax;


        if (req.body.id != null && req.body.id != undefined) {
            updateProduct();
        } else {
            addProduct();
        }

        function addProduct() {
            console.log('Add Product');
            Product.findOne({
                title: req.body.title
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
                        console.log(req.body);

                        product.save(function (err, item) { // Create User
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
        }

        function updateProduct() {
            console.log('Update Product');

            Product.updateOne({
                    _id: req.body.id
                }, {
                    $set: {
                        title: req.body.title,
                        price: req.body.price,
                        quantity: req.body.quantity,
                        description: req.body.description,
                        tax: req.body.tax,
                    }
                },
                function (err, product) {
                    if (err) {
                        console.log('err found in update qty ', err);
                        res.send({
                            success: false,
                            message: 'Something went wrong!. ' + err,
                        });
                    } else {
                        console.log('Updated Qty');
                        res.send({
                            success: true,
                            message: 'Product Details Updated'
                        });
                    }
                });
        }
    });

    /* Delete an item */
    app.post('/admin/deleteProduct', checkJWT, function (req, res) {
        console.log('Delete Item', req.body.id);
        Product.findOneAndDelete({
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

    /* Find all user details */
    app.get('/admin/getUsers', checkJWT, (req, res, next) => {
        console.log('Admin Get Users List');
        User.find(function (err, users) {
            if (err) {
                console.log('/admin/getProducts', err);
                res.json({
                    success: false,
                    message: err
                });
            } else {
                res.json({
                    success: true,
                    message: '',
                    users,
                });
            }
        });
    });

    /* Change User Status */
    app.post('/admin/changeUserStatus', (req, res, next) => {
        console.log('changeUserStatus', req.body);

        User.find({
            _id: req.body.id
        }, function (err, data) {
            if (err) {
                console.log('err found ', err);
                res.json({
                    success: false,
                    message: err
                });
            } else {
                const name = data[0].name;
                User.updateOne({
                    _id: req.body.id
                }, {
                    $set: {
                        isActive: req.body.isActive
                    }
                }, function (err, res1) {
                    if (err) {
                        console.log('err found in update qty ', err);
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        console.log('Status changed');
                        res.json({
                            success: true,
                            message: name + ' status changed'
                        });
                    }
                });
            }
        });
    });

    /* Change Manager Status */
    app.post('/admin/changeManagerStatus', (req, res, next) => {
        console.log('changeManagerStatus', req.body);
        User.find({
            _id: req.body.id
        }, function (err, data) {
            if (err) {
                console.log('err found ', err);
                res.json({
                    success: false,
                    message: err
                });
            } else {
                const name = data[0].name;
                User.updateOne({
                    _id: req.body.id
                }, {
                    $set: {
                        isManager: req.body.isManager
                    }
                }, function (err, res1) {
                    if (err) {
                        console.log('err found in update qty ', err);
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        console.log('Manager status changed');
                        res.json({
                            success: true,
                            message: name + ' - manager status changed'
                        });
                    }
                });
            }
        });
    });

    /* Change comment Status */
    app.post('/admin/commentStatus', (req, res, next) => {
        Review.find({
            _id: req.body.id
        }, function (err, data) {
            if (err) {
                console.log('err found ', err);
                res.json({
                    success: true,
                    message: err
                });
            } else {
                console.log(req.body.status);
                const visibilityStatus = req.body.status == 0 ? false : true;
                console.log(visibilityStatus);
                Review.updateOne({
                    _id: req.body.id
                }, {
                    $set: {
                        visibility: visibilityStatus
                    }
                }, function (err, res1) {
                    if (err) {
                        console.log('err found in update qty ', err);
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        console.log('Comment status changed');
                        res.json({
                            success: true,
                            message: 'Comment status changed'
                        });
                    }
                });
            }
        });
    });
};