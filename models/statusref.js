const Joi = require('joi');
const mongoose = require('mongoose');

const statusRefSchema = new mongoose.Schema({
  code : {
    type: String,
    required: true,
    // default : false
  },
  model :{
    type: String,
    required: false
  },
  submodel : {
    type : String,
    default : 'na'
  },
  description : {
    type : String,
    required : true
  },
  addedon : {
    type : Date
  }
});

const Statusref = mongoose.model('Statusref', statusRefSchema);

function validateStatusref(statusref) {
  const schema = {
    code: Joi.string().required(),
    model: Joi.string(),
    submodel: Joi.string(),
    description : Joi.string().required(),
    addedon: Joi.string()
  };

  return Joi.validate(statusref, schema);
}

exports.statusRefSchema = statusRefSchema;
exports.Statusref = Statusref; 
exports.validate = validateStatusref;