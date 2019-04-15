const Joi = require('joi');
const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  address: {
    type: String,
    required: false,
    minlength: 3,
    maxlength: 90
  },
  phone: {
    type: String,
  },
  email:{
    type: String
  }
});

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

function validateState(manufacturer) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().optional(),
  };

  return Joi.validate(manufacturer, schema);
}

exports.manufacturerSchema = manufacturerSchema;
exports.Manufacturer = Manufacturer;
exports.validate = validateState;
