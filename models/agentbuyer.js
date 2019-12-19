const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const cityModel = require('./city');
const stateModel = require('./state');
// const userModel = require("./user");
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

const agentBuyerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false
  },
  addressbasicdtl: {
    type: addridentifier,
    required: false
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
  phone: {
    type: String,
    required: false,
    maxlength: 18
  }
});

const agentbuyer = mongoose.model('AgentBuyer', agentBuyerSchema);

function validateAgentBuyer(agentbuyer) {
  const schema = {
    text: Joi.string(),
    city: Joi.objectId().optional(),
    state: Joi.objectId().optional(),
    pin: Joi.string().min(6).max(6).optional(),
    addressbasicdtl: Joi.object(),
    phone: Joi.string().max(18).optional(),
    addedby: Joi.string()
  };

  return Joi.validate(agentbuyer, schema);
}

exports.agentBuyerSchema = agentBuyerSchema;
exports.AgentBuyer = agentbuyer; 
exports.validate = validateAgentBuyer;