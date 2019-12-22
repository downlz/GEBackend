const Joi = require('joi');
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: false,
    unique : true
  },
  imageUrl : {
    type: String,
    required: false
  }
});

const Banner = mongoose.model('Banner', bannerSchema);

function validateBanner(banner) {
  const schema = {
    id: Joi.string().required(),
    imageUrl: Joi.string().optional()
  };

  return Joi.validate(banner, schema);
}

exports.bannerSchema = bannerSchema;
exports.Banner = Banner; 
exports.validate = validateBanner;