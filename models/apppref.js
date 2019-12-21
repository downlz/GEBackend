const Joi = require('joi');
const mongoose = require('mongoose');

const appPrefSchema = new mongoose.Schema({
  appversion: {
    type: String,
    required: true
  },
  appupdaterequired : {
    type: Boolean,
    required: false,
    default : false
  },
  releasedate :{
    type: Date,
    required: false
  },
  showbuyer :{
    type: Boolean,
    required: false
  },
  showseller : {
    type : Boolean,          
    required : false
  }
});

const Apppref = mongoose.model('Apppref', appPrefSchema);

function validateAppref(apppref) {
  const schema = {
    appversion: Joi.string().required(),
    appupdaterequired: Joi.boolean().optional(),
    releasedate: Joi.date().optional(),
    showbuyer: Joi.boolean().required(),
    showseller: Joi.boolean().optional(),
  };

  return Joi.validate(apppref, schema);
}

exports.appPrefSchema = appPrefSchema;
exports.Apppref = Apppref; 
exports.validate = validateAppref;