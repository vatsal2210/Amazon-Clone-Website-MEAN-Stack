module.exports = function (module, appContext) {
    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const User = module.User;
    const Order = module.Order;
    const Product = module.Product;
    const Cart = module.Cart;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");
    const {
        check,
        validationResult
    } = require('express-validator/check');
    const nodemailer = require('nodemailer');
    const crypto = require('crypto');
    const async = appContext.async;

    /* User Dashboard */
    app.get('/api/profile', checkJWT, (req, res, next) => {
        async.parallel([
            function (callback) {
                Cart.count({
                    owner: req.decoded.user._id
                }, (err, count) => {
                    let cartCount = count;
                    callback(err, cartCount);
                });
            },
            function (callback) {
                User.findOne({
                        _id: req.decoded.user._id
                    })
                    .exec((err, users) => {
                        if (err) return next(err);
                        callback(err, users);
                    });
            }
        ], function (err, results) {
            let cartCount = results[0];
            let user = results[1];
            res.json({
                success: true,
                user,
                cartCount
            });
        });
    });

    /* Store Manager Dashboard */
    app.get('/admin', checkJWT, (req, res, next) => {
        console.log('admin request found');
        User.find((err, result) => {
            console.log('User details found ', result);
            if (err) {
                console.log('Admin: User found Error ', error);
                res.send({
                    success: false,
                    message: 'Something went wrong. Try again!'
                });
                res.send({
                    success: true,
                    message: result
                });
            }
        });
    });

    /* View Cart */
    app.get('/api/cart', checkJWT, (req, res, next) => {
        console.log('cart product request found');
        async.parallel([
            function (callback) {
                Cart.count({
                    owner: req.decoded.user._id
                }, (err, count) => {
                    let cartCount = count;
                    callback(err, cartCount);
                });
            },
            function (callback) {
                Cart.find({
                        owner: req.decoded.user._id
                    })
                    .populate('products.product')
                    .exec((err, cartItem) => {
                        if (err) return next(err);
                        callback(err, cartItem);
                    });
            },
        ], function (err, results) {
            let cartCount = results[0];
            let cartItem = results[1];
            res.json({
                success: true,
                cartCount,
                cartItem,
            });
        });

        /* Cart.find({
                owner: req.decoded.user._id
            })
            .populate('products.product')
            .exec((err, cartItem) => {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Something went wrong. Try again!'
                    });
                } else {
                    console.log('Found products ', cartItem);
                    if (cartItem) {
                        res.json({
                            success: true,
                            cartItem
                        });
                    }
                }
            }); */
    });

    /* View Order */
    app.get('/api/order', checkJWT, (req, res, next) => {
        console.log('order product request found');
        Order.find({
            owner: req.decoded.user._id
        }, (err, result) => {
            console.log('Order details found ', orderproduct);
            if (err) {
                console.log('Find Order details ', error);
                res.send({
                    success: false,
                    message: 'Something went wrong. Try again!'
                });
                res.send({
                    success: true,
                    orderproduct
                });
            }
        });
    });


    /* Add to Cart */
    app.post('/api/addtocart', checkJWT, (req, res, next) => {
        console.log('post request add to cart ');
        const userId = req.decoded.user._id;
        const productId = req.body.productId;
        const action = req.body.action;
        var productQty;

        /* Find if product already added to cart change quantitiy */
        Cart.findOne({
            owner: userId,
            products: {
                $elemMatch: {
                    product: productId
                }
            }
        }, (err, productDetails) => {
            if (err) {
                console.log('Find product details error');
            } else {
                if (productDetails != '' && productDetails != null) {
                    console.log('Product is already added to cart - update it ', productDetails);
                    cartProductQty = productDetails.products[0].quantity;
                    updateCartProduct(productDetails._id, cartProductQty, function (err, result) {
                        if (err) {
                            console.log('update to cart err ', err);
                            res.json({
                                success: false,
                                message: err
                            });
                        } else {
                            console.log('updated to cart');
                            Cart.count({
                                owner: req.decoded.user._id
                            }, (err, count) => {
                                let cartCount = count;
                                console.log('cartCount ', cartCount);
                                res.json({
                                    success: true,
                                    message: "Successfully updated to cart",
                                    cartCount
                                });
                            });
                        }
                    });

                } else {
                    console.log('New product adding to cart');
                    addCartProduct(function (err, result) {
                        if (err) {
                            console.log('added to cart err ', err);
                            res.json({
                                success: false,
                                message: err
                            });
                        } else {
                            console.log('added to cart');
                            setTimeout(() => {
                                Cart.count({
                                    owner: req.decoded.user._id
                                }, (err, count) => {
                                    let cartCount = count;
                                    console.log('cartCount ', cartCount);
                                    res.json({
                                        success: true,
                                        message: "Successfully added to cart",
                                        cartCount
                                    });
                                });
                            }, 1000);
                        }
                    });
                }
            }
        });

        /* Else add to cart */
        function updateCartProduct(id, cartProductQty, cb) {
            async.waterfall([
                function (callback) {
                    Product.findOne({
                        _id: productId
                    }, (err, product) => {
                        if (product) {
                            callback(err, product);
                        }
                    });
                },
                function (product) {
                    // console.log('Found product details ', product);
                    productQuantity = product.quantity;
                    var updatedQty = action === 1 ? (productQuantity - 1) : (productQuantity + 1);

                    console.log('productQuantity ', productQuantity);
                    console.log('updatedQty ', updatedQty);
                    console.log('cartProductQty ', cartProductQty);

                    if (updatedQty === 0) {
                        console.log('Product will be 0, show alert');
                        cb('Product stock is empty. Try after some time!', null);
                    } else if (cartProductQty > updatedQty) {
                        console.log('Adding more than existing stock');
                        cb("You can't add more quantity than existing stock", null);
                    } else if (action === -1 && cartProductQty === 1) {
                        console.log('cant decrease less than 1');
                        cb("Minimum 1 quantity of product is required.", null);
                    } else {
                        console.log('cartProductQty ', cartProductQty);
                        var existProductQty = action === 1 ? (cartProductQty + 1) : (cartProductQty - 1);
                        totalPrice = (product.price * existProductQty);

                        Cart.update({
                            _id: id
                        }, {
                            $set: {
                                "products.0.quantity": existProductQty,
                                "totalPrice": totalPrice
                            }
                        }, function (err, res1) {
                            if (err) {
                                console.log('err found in update qty ', err);
                                cb(err, null);
                            } else {
                                console.log('Quantity updated');
                                updateProductQty(productQuantity);
                                cb(null, 'updated');
                            }
                        });
                    }
                }
            ]);
        }

        /* Add to cart */
        function addCartProduct(cb) {
            console.log('In add to cart');
            async.waterfall([
                function (callback) {
                    Product.findOne({
                        _id: productId
                    }, (err, product) => {
                        if (err) {
                            console.log('Details not found ', err);
                        }
                        if (product) {
                            callback(err, product);
                        }
                    });
                },
                function (product) {
                    console.log('Found product details ');
                    productQuantity = product.quantity;
                    var updatedQty = action === 1 ? (productQuantity - 1) : (productQuantity + 1);

                    console.log('productQuantity ', productQuantity);
                    console.log('updatedQty ', updatedQty);

                    if (updatedQty === 0) {
                        console.log('Product will be 0, show alert');
                        cb('Product stock is empty. Try after some time!', null);
                    } else {
                        var cart = new Cart();
                        cart.owner = req.decoded.user._id;
                        cart.totalPrice = product.price;
                        cart.products.push({
                            product: productId,
                            quantity: 1
                        });
                        cart.save();
                        updateProductQty(productQuantity);
                        cb(null, 'added');
                    }
                }
            ]);
        }

        /* Update total product Qty */
        function updateProductQty(productQuantity) {
            console.log('Time to update in total qty ', productQuantity);
            var updatedQty = action === 1 ? (productQuantity - 1) : (productQuantity + 1);
            console.log('updatedQty ', updatedQty);

            Product.findOneAndUpdate({
                _id: productId
            }, {
                $set: {
                    quantity: updatedQty
                }
            }, function (err, result) {
                if (err) {
                    console.log('Update Qty err ', err);
                }
                if (result) {
                    console.log('Qty updated to ', updatedQty);
                }
            });
        }
    });

    /* Remove Product from cart */
    app.post('/api/removeProduct', checkJWT, function (req, res) {
        var id = req.body.id;
        console.log('remove id ', id);

        Cart.findOne({
            _id: id
        }, function (err, product) {
            if (err) {
                console.log('Find err in remove product ', err);
            } else {
                console.log(product);
                console.log(product.products[0].quantity);
                console.log(product.products[0].product);
                var productId = product.products[0].product;
                var Qty = product.products[0].quantity;

                Cart.findOneAndDelete({
                    _id: id
                }, function (err, result) {
                    if (err) {
                        console.log('remove product from cart err ', err);
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        console.log('product removed & update Qty');

                        Product.update({
                            _id: productId
                        }, {
                            $inc: {
                                quantity: +Qty,
                            }
                        }, function (err, result) {
                            if (err) {
                                console.log('Found err in update qty ', err);
                                res.json({
                                    success: false,
                                    message: err
                                });
                            } else {
                                Cart.count({
                                    owner: req.decoded.user._id
                                }, (err, count) => {
                                    let cartCount = count;
                                    console.log('cartCount ', cartCount);
                                    res.json({
                                        success: true,
                                        message: "Product is removed from cart",
                                        cartCount
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    /* Clear Cart */
    app.post('/api/clearCart', checkJWT, (req, res, next) => {
        console.log('Clear cart request');
        Cart.find({
            owner: req.decoded.user._id
        }, function (err, result) {
            if (err) {

            } else {
                console.log('Found cart info', result);

                var cartProduct = result.length;
                var processProduct = 0;

                function callback() {
                    if (cartProduct === processProduct) {
                        console.log('All items are removed now');
                        res.json({
                            success: true,
                            message: 'All products are clear'
                        });
                    }
                }

                result.forEach(data => {
                    const id = data._id;
                    const Qty = data.products[0].quantity;
                    const productId = data.products[0].product;
                    console.log(Qty);
                    console.log(productId);

                    Product.update({
                        _id: productId
                    }, {
                        $inc: {
                            quantity: +Qty,
                        }
                    }, function (err, result) {
                        if (err) {
                            console.log('Update product Qty err ', err);
                        } else {
                            console.log('Qty updated now remove from cart ', id);
                            Cart.findOneAndDelete({
                                _id: id
                            }, function (err, result) {
                                if (err) {
                                    console.log('Remove product from cart err ', err);
                                } else {
                                    console.log('Item removed from cart');
                                    processProduct++;
                                    callback();
                                }
                            });
                        }
                    })
                });
            }
        })
    });

    /* Confirm Order */
    app.post('/api/orderCart', checkJWT, (req, res, next) => {
        console.log('order cart request');

        Cart.find({
            owner: req.decoded.user._id
        }, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            } else {
                console.log('Found cart info', result);

                var cartProduct = result.length;
                var processProduct = 0;

                function callback() {
                    if (cartProduct === processProduct) {
                        console.log('All items are added for order');
                        res.json({
                            success: true,
                            message: ''
                        });
                    }
                }

                result.forEach(data => {
                    const id = data._id;
                    const Qty = data.products[0].quantity;
                    const productId = data.products[0].product;
                    console.log(Qty);
                    console.log(productId);

                    Product.update({
                        _id: productId
                    }, {
                        $inc: {
                            quantity: -Qty,
                        }
                    }, function (err, result) {
                        if (err) {
                            console.log('Update product Qty err ', err);
                        } else {
                            console.log('Qty updated now remove from cart ', id);
                            Cart.findOneAndDelete({
                                _id: id
                            }, function (err, result) {
                                if (err) {
                                    console.log('Remove product from cart err ', err);
                                } else {
                                    console.log('Item removed from cart');
                                    processProduct++;
                                    callback();
                                }
                            });
                        }
                    })
                });
            }
        })
    });


};