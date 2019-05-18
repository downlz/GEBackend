const Joi = require("joi");
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    auction: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true
    },
    quantity: {
        type: Number,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    createdAt: {
        type: Date,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    }
});

const Bid = mongoose.model("Bid", bidSchema);

function validateBid(order) {
    const schema = {
        quantity: Joi.number().optional(),
        price: Joi.number().optional()
    };

    return Joi.validate(order, schema);
}

exports.bidSchema = bidSchema;
exports.Bid = Bid;
exports.validate = validateBid;
