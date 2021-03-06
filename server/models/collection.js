const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CollectionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: String,
    description: String,
    visibility: {
        type: Boolean,
        default: false,
    },
    products: [{
        _id: false,
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
    }]
});

module.exports = mongoose.model('Collection', CollectionSchema);