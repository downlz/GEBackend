const Joi = require('joi');
const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  code : {
    type: Number,
    required: false
  }
});

const State = mongoose.model('State', stateSchema);

function validateState(state) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    code: Joi.number().optional()
  };

  return Joi.validate(state, schema);
}

exports.stateSchema = stateSchema;
exports.State = State; 
exports.validate = validateState;