const Joi = require('joi');
const mongoose = require('mongoose');
const user = require('./user');
const item = require('./item');
const order = require('./order');

const pricerequestSchema = new mongoose.Schema({
  requestedon: {
    type: Date,
    required: false
  },
  buyerquote: {
    type: Number,
    required: false
  },
  sellerquote: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['placed', 'countered', 'accepted', 'rejected','paused'],
    required: false
  }
});

const pauseBargain = new mongoose.Schema({
  isPaused: {
    type: Boolean,
    required: false
  },
  pausetype: {
    type: String,
    enum: ['hours', 'dates'],
    required: false
  },
  pausehrs: {
    type: Number,
    required: false
  },
  pausestarttime: {
    type: Date,
    required: false
  },
  pauseendtime: {
    type: Date,
    required: false
  }
});

const bargainSchema = new mongoose.Schema({
  item: {
    type: item.itemSchema,
    required: false
  },
  seller: {
    type: user.userSchema,
    required: false
  },
  buyer: {
    type: user.userSchema,
    required: false
  },
  quantity: {
    type: Number,
    required : true
  },
  firstquote : {
    type : pricerequestSchema,
    required : false
  },
  secondquote : {
    type : pricerequestSchema,
    required : false
  },
  thirdquote : {
    type : pricerequestSchema,
    required : false
  },
  bargaincounter : {
    type : Number,
    required : false,
    default : 0
  },
  bargainstatus: {
    type: String,
    enum: ['placed', 'negotiation', 'accepted', 'rejected','paused','expired'],
    required: false
  },
  lastupdated: {
    type : Date,
    required : false
  },
  orderid : {
    type : order.orderSchema,
    required : false
  },
  pausebargain :{
    type : pauseBargain,
    required: false
    }
});

const Bargain = mongoose.model('Bargain', bargainSchema);

function validateBargain(bargain) {
  const schema = {
    item: Joi.objectId().required(),
    seller: Joi.objectId().optional(),
    buyer: Joi.objectId().optional(),
    quantity : Joi.number().required(),
    firstquote: Joi.object().required(),
    secondquote: Joi.object().required(),
    thirdquote: Joi.object().required(),
    bargaincounter: Joi.number().optional(),
    bargainstatus: Joi.string().optional(),
    lastupdated: Joi.string().optional(),
    orderid : Joi.objectId().optional(),
    pausebargain : Joi.object().optional()
  };

  return Joi.validate(bargainrqst, schema);
}

exports.bargainSchema = bargainSchema;
exports.Bargain = Bargain;
exports.validate = validateBargain;
