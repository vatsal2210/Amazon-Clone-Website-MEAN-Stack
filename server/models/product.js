const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    /* category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }, */
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    image: {
        type: String,
        default: '',
    },
    title: String,
    description: String,
    tax: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        default: 0,
    },
    created: {
        type: Date,
        default: Date.now
    }
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);