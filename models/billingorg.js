const Joi = require('joi');
const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 150
  },
  email: {
    type: String,
    required: false,
    minlength: 3,
    maxlength: 255
  },
  pan: {
    type: String,
    required: false,
    minlength: 5,
    maxlength: 10
  },
  gstin: {
    type: String,
    required: false,
    minlength: 5,
    maxlength: 15
  },
  cin : {
    type: String,
    required: false
  },
  isactive :{
    type: Boolean,
    required: false,
    default: false
  },
  orgtype: {
    type: String,                                     // User Classification eg. small,large,corporate,institutional
    required: false
  }
});

const Org = mongoose.model('Org', orgSchema);

function validateOrg(org) {
  const schema = {
    name: Joi.string().min(3).max(150).required(),
    email: Joi.string().min(3).max(255).optional().email(),
    pan: Joi.string().min(5).max(10).optional(),
    gstin: Joi.string().min(5).max(15).optional(),
    cin: Joi.string().optional(),
    isactive: Joi.boolean().optional(),
    orgtype: Joi.string().optional()
  };

  return Joi.validate(org, schema);
}

exports.orgSchema = orgSchema;
exports.Billingorg = Org;
exports.validate = validateOrg;
