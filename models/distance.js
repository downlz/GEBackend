const Joi = require('joi');
const mongoose = require('mongoose');
const city = require('./city');

const distanceSchema = new mongoose.Schema({
  from: {
    type: city.citySchema,
    required: true
  },
  to:{
    type: city.citySchema,
    required: true
  },
  distance:{
    type: Number,
    required: true
  }
});

const Distance = mongoose.model('Distance', distanceSchema);

function validateDistance(distance) {
  const schema = {
    fromId: Joi.objectId().required(),
    toId: Joi.objectId().required(),
    distance: Joi.string().min(1).max(5).required()
  };

  return Joi.validate(distance, schema);
}

exports.distanceSchema = distanceSchema;
exports.Distance = Distance;
exports.validate = validateDistance;
