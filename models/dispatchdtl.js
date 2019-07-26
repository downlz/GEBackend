const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('./user');
const Order = require('./order');

const dispatchDtlSchema = new mongoose.Schema({
  orderno: {
      type: String,
      required: true
    },
  orderid: {                                            // For future development
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  vehicleno: {
    type: String,
    required : true
  },
  vehicledtl: {
    type: String,
    required: true
  },
  transportcost: {
    type: Number,
    required: false
  },
  dispatchtime: {
    type: Date,
    required: false
  },
  status : {
    type: String,
    enum: ['in-transit', 'booked','delivered','loading','unloading'],
    required: false
  },
  createdOn :{
    type: Date,
    required: false
  },
  lastUpdatedOn :{
    type: Date,
    required: false
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

const DispatchDtl = mongoose.model('DispatchDtl', dispatchDtlSchema);

function validateDispatchDtl(dispatchdtl) {
  const schema = {
    orderno: Joi.string().required(),
    orderid: Joi.objectId(),
    vehicleno : Joi.string().required(),
    vehicledtl : Joi.string(),
    transportcost : Joi.number(),
    dispatchtime : Joi.string(),
    status : Joi.string(),
    createdOn : Joi.string(),
    lastUpdatedOn: Joi.string().optional(),
    addedby: Joi.objectId()
  };

  return Joi.validate(dispatchdtl, schema);
}

exports.dispatchDtlSchema = dispatchDtlSchema;
exports.DispatchDtl = DispatchDtl;
exports.validate = validateDispatchDtl;