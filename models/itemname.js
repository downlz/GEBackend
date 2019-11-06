const Joi = require('joi');
const mongoose = require('mongoose');


const itemnameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  image: {
    type: String,
    required: false
  },
  hsn: {
    type: String,
    required: false,
  },
  tax: {
    type: Number,
    required: false
  },
  insurance: {
    type: Number,
    required: false
  },
  season: {
    type: String,
    required: false
  },
  mfgdate: {
    type: String,
    required: false
  }
});

const ItemName = mongoose.model('ItemName', itemnameSchema);

function validateItemName(itemname) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    tax: Joi.number().optional(),
    image: Joi.string(),
    insurance: Joi.number().optional(),
    hsn: Joi.string().optional(),
    season: Joi.string().optional(),
    mfgdate: Joi.string().optional()
  };

  return Joi.validate(itemname, schema);
}

exports.itemnameSchema = itemnameSchema;
exports.ItemName = ItemName; 
exports.validate = validateItemName;