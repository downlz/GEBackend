const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('./user');
const City = require('./city');

const transportRateSchema = new mongoose.Schema({
  from: {
    type: City.citySchema,
    required: true
  },
  to: {
    type: City.citySchema,         
    required: true
  },
  distance:{
    type: Number,
    required: false
  },
  capacity:{
    type: Number,
    required: true
  },
  tonnagein : {
    type: String,
    enum: ['Quintal', 'Tonne'],
    required: false
  },
  duration: {                   // All duration in hrs
    type: Number,
    required: false
  },
  pricequote: {
    type: Number,
    required: true
  },
  vehicledtl: {
    type: String,
    required: false
  },
  isinsured : {                                                 // For Future development
    type : Boolean,
    required: false,
    default: false
  },
  isactive : {
    type :  Boolean,
    required : false
  },
  addedby : {
    type: User.userSchema,
    required: false
  },
  createdOn :{
    type: Date,
    required: false
  },
  lastUpdatedOn :{
    type: Date,
    required: false
  }
});

const TransportRate = mongoose.model('TransportRate', transportRateSchema);

function validateTransportRate(transportrate) {
  const schema = {
    fromId : Joi.objectId().required(),
    toId : Joi.objectId().required(),
    distance : Joi.number().optional(),
    capacity : Joi.number().required(),
    tonnagein : Joi.string().optional(),
    duration : Joi.number().optional(),
    pricequote : Joi.number().required(),
    vehicledtl: Joi.string().optional(),
    isinsured : Joi.boolean().optional(),
    isactive: Joi.boolean().optional(),
    addedby : Joi.objectId().required(),
    createdOn : Joi.string().optional(),
    lastUpdatedOn : Joi.string().optional()
  };

  return Joi.validate(transportrate, schema);
}

exports.transportRateSchema = transportRateSchema;
exports.TransportRate = TransportRate;
exports.validate = validateTransportRate;
