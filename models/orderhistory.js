// This schema is to track all changes made to an order (It can be an auction order or some other type which is yet 
// to be defined)
const Joi = require("joi");
const mongoose = require("mongoose");
const itemModel = require("./item");
const userModel = require("./user");
const addressModel = require("./address");
const auctionModel = require("./auction");
const gblistModel = require("./gblist");
const orderModel = require("./order")

const orderSchema = new mongoose.Schema({
  order: {                        // To trace the order on which changes are being made
    type: orderModel.orderSchema,
    required: true
  },
  quantity: {
    type: Number,
    required: false
  },
  unit: {                     // Provisional in case requried
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: false
  },
  cost: {                     // System calculated value
    type: Number,
    required: false
  },
  modifiedTime: {
    type: Date,
    required: false
  },
  modifiedBy: {
    type: userModel.userSchema,
    required: false
  }
});

const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
  const schema = {
    orderno: Joi.string().optional(),
    itemId: Joi.objectId().required(),
    quantity: Joi.number().optional(),
    cost: Joi.number().optional(),
    addressId: Joi.objectId().optional(),
    buyerId: Joi.objectId().required(),
    sellerId: Joi.objectId().required(),
    placedTime: Joi.string().required(),
    confirmedTime: Joi.string().optional(),
    shipmentTime: Joi.string().optional(),
    receivedTime: Joi.string().optional(),
    paymentMode: Joi.string().optional(),
    status: Joi.string().optional(),
    ordertype: Joi.string().optional(),
    referenceGB: Joi.objectId().optional(),
    referenceAuction: Joi.objectId().optional()
  };

  return Joi.validate(order, schema);
}

exports.orderSchema = orderSchema;
exports.Order = Order;
exports.validate = validateOrder;
