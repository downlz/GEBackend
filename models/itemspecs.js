const Joi = require('joi');
const mongoose = require('mongoose');


const itemspecSchema = new mongoose.Schema({
  moisture: {
    type: Number,
    required: false
  },
  graincount: {
    type: Number,
    required: false
  },
  icumsa: {
    type: Number,
    required: false
  }
});

const ItemSpec = mongoose.model('ItemSpec', itemspecSchema);

function validateItemSpec(itemspec) {
  const schema = {
    moisture: Joi.number().optional(),
    graincount: Joi.number().optional(),
    icumsa: Joi.number().optional()
  };

  return Joi.validate(itemspec, schema);
}

exports.itemspecSchema = itemspecSchema;
exports.ItemSpec = ItemSpec;
exports.validate = validateItemSpec;
