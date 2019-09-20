// For future use
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
const address = require('./address');

const userSchema = new mongoose.Schema({
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
    minlength: 13,
    maxlength: 13
  },
  pan: {
    type: String,
    required: false,
    minlength: 5,
    maxlength: 50
  },
  GST: {
    type: String,
    required: false,
    minlength: 5,
    maxlength: 100
  },
  addressline: {
    type: String,
    required: false,
  },
  pin : {
    type: Number,
    required: false
  },
  isactive : {
    type: Boolean,
    required: false,
    default: false
  },
  userType: {
    type: String,                        
    enum: ['seller','buyer','both','transporter'],
    required: false
  }
});

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).optional().email(),
    phone: Joi.string().length(13).required(),
    pan: Joi.string().min(5).max(50).optional(),
    GST: Joi.string().min(5).max(100).optional(),
    addressline: Joi.string().optional(),
    pin: Joi.number().optional(),
    isactive: Joi.boolean().optional(),
    userType: Joi.string().optional()
  };

  return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateUser;
