const Joi = require('joi');
const mongoose = require('mongoose');

const taxrateSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  ratepct : {
    type: Number,
    required: false,
    default : 0
  },
  startdate :{
    type: Date,
    required: true
  },
  enddate :{
    type: Date,
    required: true
  },
  finyear : {
    type : String,          
    required : false
  },
  assessmentyear : {
    type : String,
    required : false
  }
});

const Taxrate = mongoose.model('Taxrate', taxrateSchema);

function validateTaxrate(taxrate) {
  const schema = {
    type: Joi.string().required(),
    ratepct: Joi.number().optional(),
    startdate: Joi.date().required(),
    enddate: Joi.date().required(),
    finyear: Joi.string().optional(),
    assessmentyear: Joi.string().optional()

  };

  return Joi.validate(taxrate, schema);
}

exports.taxrateSchema = taxrateSchema;
exports.Taxrate = Taxrate; 
exports.validate = validateTaxrate;