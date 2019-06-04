const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const cityModel = require('./city');
const stateModel = require('./state');
// const userModel = require('./user');
// const ObjectId = Schema.Types.ObjectId

const addridentifier = new mongoose.Schema({
  partyname: {
    type: String,
    required: false
  },
  gstin: {
    type: String,
    required: false
  }
}); 

const addressSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false,
    minlength: 5,
    maxlength: 150
  },
  city: {
    type: cityModel.citySchema,
    required: false
  },
  state: {
    type: stateModel.stateSchema,
    required: false
  }, 
  addedby: {
    type: String,
    required: false
  },
  pin: {
    type: String,
    required: false, 
    minlength: 6,
    maxlength: 6
  },
  addresstype: {
    type: String,
    enum: ['factory', 'outlet', 'retail', 'warehouse','others','registered','delivery'],
    required: false
  },
  addressbasicdtl: {
    type: addridentifier,
    required: false
  },
  phone: {
    type: String,
    required: false,
    maxlength: 18
  }
});

const address = mongoose.model('Address', addressSchema);

function validateAddress(address) {
  const schema = {
    text: Joi.string().min(5).max(150).optional(),
    city: Joi.object().optional(),
    state: Joi.objectId().optional(),
    pin: Joi.string().min(6).max(6).optional(),
    addresstype: Joi.string().optional(),
    addressbasicdtl: Joi.object().optional(),
    phone: Joi.string().max(18).optional(),
    addedby: Joi.string().optional()
  };

  return Joi.validate(address, schema);
}

exports.addressSchema = addressSchema;
exports.Address = address; 
exports.validateAddress = validateAddress;