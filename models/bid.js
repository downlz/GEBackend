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
    },
    manufacturer: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    marketingExpense: {
        type: Number,
        required: false
    },
    orderConfirmed: {
        type: Boolean,
        required: false,
        default: false
    },
    agentbid: {
        type: mongoose.Schema.Types.ObjectId, ref: 'AgentBid', default: null
    }
});

const Bid = mongoose.model("Bid", bidSchema);

function validateBid(order) {
    const schema = {
        quantity: Joi.number().optional(),
        price: Joi.number().optional(),
        auction: Joi.objectId(),
        manufacturer: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
        marketingExpense: Joi.number().optional(),
        orderConfirmed : Joi.boolean().optional()
    };

    return Joi.validate(order, schema);
}

exports.bidSchema = bidSchema;
exports.Bid = Bid;
exports.validate = validateBid;
