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
    itemCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    sampleNo: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true},
    auctionType: {
        type: String
        , required: true
    },
    address: {
        type: String
        , required: true
    },
    pincode: {
        type: String
        , required: true
    },
    state: {
        type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true
    },
    availableQty: {
        type: Number,
        required: true
    },
    maxQty: {
        type: Number,
        //required: true
    },
    minQty: {
        type: Number,
        //required: true
    },
    unit: {type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true},
    floorPrice: {
        type: Number,
        required: true
    },
    ceilingPrice: {
        type: Number,
        //required: true
    },
    nameVisible: {
        type: Boolean,
        required: true
    },
    transportCost: {
        type: Boolean,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    approved: {
        type: Boolean,
        defaultValue: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    remarks: {
        type: String,
        required: false
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
        itemName: Joi.objectId(),
        itemCategory: Joi.objectId(),
        sampleNo: Joi.objectId(),
        auctionType: Joi.string().required(),
        address: Joi.string().required(),
        pincode: Joi.string().required(),
        state: Joi.objectId(),
        availableQty: Joi.number().required(),
        minQty: Joi.number()/*.required()*/,
        maxQty: Joi.number()/*.required()*/,
        unit: Joi.objectId().required(),
        floorPrice: Joi.number().required(),
        ceilingPrice: Joi.number()/*.required()*/,
        nameVisible: Joi.boolean().required(),
        transportCost: Joi.boolean().required(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        //Buyer or seller Id
        user: Joi.objectId().required(),
        remarks: Joi.string().optional().allow('')
    };

    return Joi.validate(item, schema);
}

exports.auctionSchema = auctionSchema;
exports.Auction = Auction;
exports.validate = validateItem;
