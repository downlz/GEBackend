const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const category = require('./category');
const item = require('./item');
const unit = require('./unit');
const user = require('./user');
const itemname = require('./itemname');


const auctionSchema = new mongoose.Schema({
    itemName: {type: mongoose.Schema.Types.ObjectId, ref: 'ItemName', required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true},
    auctionType: {
        type: String
        , required: true
    },
    category: {
        type: category.categorySchema,
        required: true
    },
    availableQty: {
        type: Number,
        required: true
    },
    maxQty: {
        type: Number,
        required: true
    },
    minQty: {
        type: Number,
        required: true
    },
    unit: {type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true},
    floorPrice: {
        type: Number,
        required: true
    },
    ceilingPrice: {
        type: Number,
        required: true
    },
    nameVisible: {
        type: Boolean,
        required: true
    },
    transportCost: {
        type: Boolean,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

const Auction = mongoose.model('Auction', auctionSchema);

function validateItem(item) {
    const schema = {
        itemName: Joi.objectId().required(),
        category: Joi.objectId().required(),
        item: Joi.objectId().required(),
        auctionType: Joi.string().required(),
        availableQty: Joi.number().required(),
        minQty: Joi.number().required(),
        maxQty: Joi.number().required(),
        unit: Joi.objectId().required(),
        floorPrice: Joi.number().required(),
        ceilingPrice: Joi.number().required(),
        nameVisible: Joi.boolean().required(),
        transportCost: Joi.boolean().required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        user: Joi.objectId().required(),

    };

    return Joi.validate(item, schema);
}

exports.auctionSchema = auctionSchema;
exports.Auction = Auction;
exports.validate = validateItem;
