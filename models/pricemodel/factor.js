const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const factorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 30
  },
  type: {
    type: String,
    required: true,
    enum: ['static','transactional']
  },
  addedon: {
      type: Date,
      required: false
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
},
});

const factor = mongoose.model('Factor', factorSchema);

function validateFactor(factor) {
  const schema = {
    name: Joi.string().max(30).required(),
    type: Joi.string().required(),
    addedon: Joi.date().optional(),
    addedby: Joi.objectId().required(),
  };

  return Joi.validate(factor, schema);
}

exports.validateFactor = validateFactor;
exports.Factor = factor; 
exports.validate = validateFactor;