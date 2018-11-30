module.exports = function (module, appContext) {

    const app = appContext.app;
    const jwt = appContext.jwt;
    const config = appContext.config;
    const Product = module.Product;
    const Token = module.Token;
    const checkJWT = require("../util/jwtUtil.js");
    const {
        check,
        validationResult
    } = require('express-validator/check');
    const nodemailer = require('nodemailer');
    const crypto = require('crypto');
    const async = appContext.async;

    app.get('/api/products', (req, res, next) => {
        console.log('Products page found');
        const perPage = 10;
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
                Product.find({})
                    .skip(perPage * page)
                    .limit(perPage)
                    // .populate('owner')
                    .exec((err, products) => {
                        if (err) return next(err);
                        callback(err, products);
                    });
            }
        ], function (err, results) {
            let totalProducts = results[0];
            let products = results[1];
            console.log('totalProducts ', totalProducts);
            console.log('products ', products);
            res.json({
                success: true,
                message: 'category',
                products,
                totalProducts: totalProducts,
                pages: Math.ceil(totalProducts / perPage)
            });
        });
    });
};