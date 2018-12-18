module.exports = function (module, appContext) {

    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const Product = module.Product;
    const Review = module.Review;
    const Cart = module.Cart;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");
    const {
        check,
        validationResult
    } = require('express-validator/check');
    const async = appContext.async;

    /* Get Top 10 Products */
    // app.get('/api/topproducts', (req, res, next) => {
    //     console.log('Products page found');
    //     const perPage = 10;

    //     async.parallel([
    //         function (callback) {
    //             Product.count({}, (err, count) => {
    //                 let totalProducts = count;
    //                 callback(err, totalProducts);
    //             });
    //         },
    //         function (callback) {
    //             Product.find({})
    //                 .populate('review')
    //                 .exec((err, products) => {
    //                     if (err) return next(err);
    //                     callback(err, products);
    //                 });
    //         }
    //     ], function (err, results) {
    //         let topproducts = results[1];
    //         console.log(topproducts);
    //         res.json({
    //             success: true,
    //             topproducts,
    //         });
    //     });
    // });

    /* Get Product List */
    app.get('/api/products', (req, res, next) => {
        console.log('Products page found');
        const perPage = 100;
        const page = req.query.page;
        console.log('page ', page);        

        async.parallel([
            function (callback) {
                Product.count({}, (err, count) => {
                    let totalProducts = count;
                    console.log('Total Product ', totalProducts);
                    callback(err, totalProducts);
                });
            },
            function (callback) {
                Product.find({
                        quantity: {
                            $gt: 0
                        }
                    })
                    .skip(perPage * page)
                    .limit(perPage)
                    .populate('review')
                    .exec((err, products) => {
                        if (err) return next(err);
                        callback(err, products);
                    });
            },           
        ], function (err, results) {
            let totalProducts = results[0];
            let products = results[1];            

            const topProducts = [];
            console.log('products ', products);
            for (let i = 0; i < products.length; i++) {
                console.log(products[i].reviews.length);
                if (products[i].reviews.length >= 2) {
                    topProducts.push(products[i]);
                }
            }
            console.log(topProducts.length);
            res.json({
                success: true,
                products,
                totalProducts: totalProducts,
                topProducts: topProducts,                
                pages: Math.ceil(totalProducts / perPage)
            });
        });
    });

    /* Find Product Details */
    app.get('/api/findProduct/:id', function (req, res) {
        console.log('Find Product Details ', req.params.id);
        const commentLimit = 2;
        Product.find({
                _id: req.params.id
            })
            .populate({
                path: 'reviews',
                match: {
                    visibility: true
                },
                options: {
                    limit: 5,
                    sort: {
                        create: -1
                    }
                }
            })
            .deepPopulate('reviews.owner')
            .exec((err, product) => {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Product is not found'
                    });
                } else {
                    if (product) {
                        res.json({
                            success: true,
                            product
                        });
                    }
                }
            });
    });

    /* Review and Comment */
    app.post('/api/review', checkJWT, (req, res, next) => {
        console.log('Review submit');
        async.waterfall([
            function (callback) {
                Product.findOne({
                    _id: req.body.productId
                }, (err, product) => {
                    if (product) {
                        callback(err, product);
                    }
                });
            },
            function (product) {
                let review = new Review();
                review.owner = req.decoded.user._id;

                if (req.body.description) review.description = req.body.description;
                review.rating = req.body.rating;

                product.reviews.push(review._id);
                product.save();
                review.save();
                res.json({
                    success: true,
                    message: "Successfully added the review"
                });
            }
        ]);
    });
};