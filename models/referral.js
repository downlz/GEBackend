const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('./user');

const referralSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: false,
    minlength: 5,
    maxlength: 255
  },
  phone: {
    type: String,
    required: true, 
    unique : true,    
    minlength: 6,             // Assuming user is sending landline no. also
    maxlength: 16
  },
  referredby: {
    type: User.userSchema,
    required: false,
  },
  referralcode:{
    type: String,
    required: false
  }
});

const Referral = mongoose.model('Referral', referralSchema);

function validateReferral(referral) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).optional().email(),
    phone: Joi.string().min(6).max(20).optional(),
    referredby: Joi.objectId().required(),
    referralcode: Joi.string().optional()
  };

  return Joi.validate(referral, schema);
}

exports.referralSchema = referralSchema;
exports.Referral = Referral;
exports.validate = validateReferral;
