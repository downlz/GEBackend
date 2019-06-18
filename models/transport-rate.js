const Joi = require('joi');
const mongoose = require('mongoose');

const transportRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  vehicletype:{
    type: String,
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
  };

  return Joi.validate(transportrate, schema);
}

exports.transportRateSchema = transportRateSchema;
exports.TransportRate = TransportRate;
exports.validate = validateTransportRate;
