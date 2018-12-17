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
        Cart.find({
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
            });
    });

    /* View Order */
    app.get('/api/order', (req, res, next) => {
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
        // var quantity = req.body.quantity;
        const action = req.body.action;
        var productQty;

        console.log('req for ', productId);
        console.log('action ', action);
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
                            res.json({
                                success: true,
                                message: "Successfully updated to cart"
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
                            res.json({
                                success: true,
                                message: "Successfully added to cart"
                            });
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
                    console.log('Found product details ', product);
                    productQuantity = product.quantity;
                    var updatedQty = action === 1 ? (productQuantity - 1) : (productQuantity + 1);

                    if (updatedQty === 0) {
                        console.log('Product will be 0, show alert');
                        cb('Product stock is empty. Try after some time!', null);
                    } else if (updatedQty > productQuantity) {
                        console.log('Adding more than existing stock');
                        cb("You can't add more quantity than existing stock", null);
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
                    console.log('Found product details ', product);
                    productQuantity = product.quantity;
                    var updatedQty = action === 1 ? (productQuantity - 1) : (productQuantity + 1);

                    if (updatedQty === 0) {
                        console.log('Product will be 0, show alert');
                        cb('Product stock is empty. Try after some time!', null);
                    } else if (updatedQty > productQuantity) {
                        console.log('Adding more than existing stock');
                        cb("You can't add more quantity than existing stock", null);
                    } else {
                        let cart = new Cart();
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

            Product.updateOne({
                _id: productId
            }, {
                $set: {
                    quantity: updatedQty
                }
            }, (err, product) => {
                if (err) {
                    console.log('Update Qty err ', err);
                }
                if (product) {
                    console.log('Qty updated to ', updatedQty);
                }
            });
        }
    });

    /* Remove Product from cart */
    app.post('/api/removeProduct', (req, res, next) => {
        const id = req.body.id;
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
                const productId = product.products[0].product;
                const Qty = product.products[0].quantity;

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
                                res.json({
                                    success: true,
                                    message: 'Item removed'
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    /* Confirm Order */



};