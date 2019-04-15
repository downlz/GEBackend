const Joi = require('joi');
const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  mass: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20
  }
});

const Unit = mongoose.model('Unit', unitSchema);

function validateUnit(unit) {
  const schema = {
    mass: Joi.string().min(2).max(20).required()
  };

  return Joi.validate(unit, schema);
}

exports.unitSchema = unitSchema;
exports.Unit = Unit;
exports.validate = validateUnit;
