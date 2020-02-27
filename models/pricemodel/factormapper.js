const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const factorMapperSchema = new mongoose.Schema({
  mapping: {
    type: Object,
    required: false
  },
  addedon: {
      type: Date,
      required: false
  },
  type : {             // For Future use
    type: String,
  },
  addedby: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
},
});

const factormapper = mongoose.model('FactorMapper', factorMapperSchema);

function validateFactorMapper(factormapper) {
  const schema = {
    mapping: Joi.object().optional(),
    addedon: Joi.date().optional(),
    addedby: Joi.objectId().required(),
  };

  return Joi.validate(factormapper, schema);
}

exports.validateFactorMapper = validateFactorMapper;
exports.FactorMapper = factormapper; 
exports.validate = validateFactorMapper;