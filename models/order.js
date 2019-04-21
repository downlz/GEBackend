const Joi = require("joi");
const mongoose = require("mongoose");
const itemModel = require("./item");
const userModel = require("./user");
const addressModel = require("./address");

const orderSchema = new mongoose.Schema({
  orderno:{
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
    enum: ['new', 'confirmed', 'ready','shipped', 'delivered','cancelled'],
    required: false
  },
  ordertype: {
    type: String,
    enum: ['regular', 'groupbuying', 'auction', 'bidding','sampleorder'],
    required: false
  }
  // referenceGB: {
  //   type : gblistModel.groupbuyingSchema,
  //   required: false
  // },
  // referenceAuction :{
  //   type : auctionModel.auctionSchema,
  //   required:false
  // }
});

const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
  const schema = {
    orderno: Joi.string().optional(),
    itemId: Joi.objectId().required(),
    quantity: Joi.number().optional(),
    cost: Joi.number().optional(),
    price: Joi.number().optional(),
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
    // referenceGBId: Joi.objectId().optional(),
    // referenceAuctionId: Joi.objectId().optional(),
  };

  return Joi.validate(order, schema);
}

exports.orderSchema = orderSchema;
exports.Order = Order;
exports.validate = validateOrder;