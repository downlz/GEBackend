const Joi = require("joi");
const mongoose = require("mongoose");
const itemModel = require("./item");
const unitModel = require("./unit");
const userModel = require("./user");
const addressModel = require("./address");
const gblistModel = require("./gblist");
const auctionModel = require("./auction");

const shipto = new mongoose.Schema({
  partyname: {
    type: Number,
    required: false
  },
  gstin: {
    type: Number,
    required: false
  },
  address: {
    type: addressModel.addressSchema,
    required: false
  }
});

const orderSchema = new mongoose.Schema({
    orderno: {
        type: String,
        required: false
    },
    item: {
        type: itemModel.itemSchema,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    unit: {
        type: String,
        required: false
    },
    cost: {
        type: Number,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    address: {
        type: addressModel.addressSchema,
        required: false
    },
    buyer: {
        type: userModel.userSchema,
        required: false
    },
    seller: {
        type: userModel.userSchema,
        required: false
    },
    placedTime: {
        type: Date,
        required: false
    },
    confirmedTime: {
        type: Date,
        required: false
    },
    readyTime: {
        type: Date,
        required: false
    },
    shipmentTime: {
        type: Date,
        required: false
    },
    receivedTime: {
        type: Date,
        required: false
    },
    paymentMode: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['new', 'confirmed', 'ready', 'shipped', 'delivered', 'cancelled'],
        required: false
    },
    ordertype: {
        type: String,
        enum: ['regular', 'groupbuying', 'auction', 'bidding', 'sampleorder'],
        required: false
    },
    referenceGB: {
        type: gblistModel.groupbuyingSchema,
        required: false
    },
    referenceAuction: {
        type: auctionModel.auctionSchema,
        required: false
    }
});

const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
    const schema = {
        orderno: Joi.string().optional(),
        itemId: Joi.objectId().required(),
        quantity: Joi.number().optional(),
        unit: Joi.string().required(),
        cost: Joi.number().optional(),
        price: Joi.number().optional(),
        addressId: Joi.objectId().optional(),
        buyerId: Joi.objectId().optional(),
        sellerId: Joi.objectId().optional(),
        placedTime: Joi.string().required(),
        confirmedTime: Joi.string().optional(),
        readyTime: Joi.string().optional(),
        shipmentTime: Joi.string().optional(),
        receivedTime: Joi.string().optional(),
        paymentMode: Joi.string().optional(),
        status: Joi.string().optional(),
        ordertype: Joi.string().optional(),
        referenceGBId: Joi.objectId().optional(),
        referenceAuctionId: Joi.objectId().optional(),
    };

    return Joi.validate(order, schema);
}

exports.orderSchema = orderSchema;
exports.Order = Order;
exports.validate = validateOrder;
