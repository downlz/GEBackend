const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('./user');

const transportRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  vehicletype:{
    type: String,         // Open Body,Closed Body
    required: false
  },
  capacity:{
    type: String,
    required: true
  },
  rate : {
    type: Number,
    required: true
  },
  isinsured : {                                                 // For Future development
    type : Boolean,
    required: false,
    default: false
  },
  addedby : {
    type: User.userSchema,
    required: true
  },
  createdOn :{
    type: Date,
    required: true,
    default: null
  },
  lastUpdatedOn :{
    type: Date,
    required: false
  }
});

const TransportRate = mongoose.model('TransportRate', transportRateSchema);

function validateTransportRate(transportrate) {
  const schema = {
    name: Joi.string().optional(),
    vehiclestype: Joi.string().optional(),
    capacity: Joi.string().max(20).required(),
    rate : Joi.string().required(),
    isinsured : Joi.string().optional(),
    addedby : Joi.objectid().optional(),
    createdOn : Joi.string().optional(),
    lastUpdatedOn : Joi.string().optional()
  };

  return Joi.validate(transportrate, schema);
}

exports.transportRateSchema = transportRateSchema;
exports.TransportRate = TransportRate;
exports.validate = validateTransportRate;
