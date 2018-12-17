module.exports = function (appContext) {

    const module = {};

    /* MongodB Models */
    const Token = require("../models/token");
    module.Token = Token;

    const Product = require('../models/product');
    module.Product = Product;

    const Review = require('../models/review');
    module.Review = Review;

    const Cart = require('../models/cart');
    module.Cart = Cart;

    const Order = require('../models/order');
    module.Order = Order;

    const User = require('../models/users');
    module.User = User;

    const Collection = require('../models/collection');
    module.Collection = Collection;

    /* Other Routing Files */
    const accountRoute = require('./account.js')(module, appContext);
    const userRoute = require("./user.js")(module, appContext);
    const productRoute = require('./products.js')(module, appContext);
    const adminRoute = require("./admin.js")(module, appContext);
    const collectionRoute = require("./collection.js")(module, appContext);

};