const Joi = require("joi");
const mongoose = require("mongoose");

const bidHistorySchema = new mongoose.Schema({
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
    },
    manufacturer: {
        type: String,
        required: false
    },
    marketingExpense: {
        type: Number,
        required: false
    }
});

const BidHistory = mongoose.model("BidHistory", bidHistorySchema);

function validateBid(order) {
    const schema = {
        quantity: Joi.number().optional(),
        price: Joi.number().optional(),
        auction: Joi.objectId(),

        manufacturer: Joi.string().optional(),
        marketingExpense: Joi.number().optional()
    };
    return Joi.validate(order, schema);
}

exports.bidHistorySchema = bidHistorySchema;
exports.BidHistory = BidHistory;
exports.validate = validateBid;
