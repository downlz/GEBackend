const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('./user');
const City = require('./city');

const transportRateHisSchema = new mongoose.Schema({
  from: {
    type: City.citySchema,
    required: false
  },
  to: {
    type: City.citySchema,
    required: false
  },
  distance: {
    type: Number,
    required: false
  },
  capacity: {
    type: Number,
    required: true
  },
  tonnagein: {
    type: String,
    enum: ['Quintal', 'Tonne'],
    required: false
  },
  duration: { // All duration in hrs
    type: Number,
    required: false
  },
  pricequote: {
    type: Number,
    required: true
  },
  isinsured: { // For Future development
    type: Boolean,
    required: false,
    default: false
  },
  addedby: {
    type: User.userSchema,
    required: true
  },
  createdOn: {
    type: Date,
    required: true,
    default: null
  },
  lastUpdatedOn: {
    type: Date,
    required: false
  }
});

const transportRateHis = mongoose.model('transportRateHis', transportRateHisSchema);

function validatetransportRateHis(transportratehis) {
  const schema = {
    from: Joi.objectid().optional(),
    to: Joi.objectid().optional(),
    distance: Joi.number.optional(),
    capacity: Joi.number().required(),
    tonnagein: Joi.string().required(),
    duration: Joi.number().optional(),
    pricequote: Joi.number().required(),
    isinsured: Joi.boolean().optional(),
    addedby: Joi.objectid().optional(),
    createdOn: Joi.string().optional(),
    lastUpdatedOn: Joi.string().optional()
  };
  return Joi.validate(transportratehis, schema);
}

exports.transportRateHisSchema = transportRateHisSchema;
exports.transportRateHis = transportRateHis;
exports.validate = validatetransportRateHis;
