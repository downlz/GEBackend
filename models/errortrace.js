const Joi = require('joi');
const mongoose = require('mongoose');

const errorTraceSchema = new mongoose.Schema({
  user: {
    type: String,
    required: false
  },
  message : {
    type: String,
    required: false
  },
  logdate :{
    type: Date,
    required: false
  },
  appversion :{
    type: String,
    required: false
  },
  apppage: {
    type: String,
    required: false,
  },
  source :{
    type: String,
    required: false,
    enum: ['WEB', 'ANDRIOD', 'IOS'],
  }
});

const Errortrace = mongoose.model('Errortrace', errorTraceSchema);

function validateErrortrace(errortrace) {
  const schema = {
    user: Joi.string().required(),
    message: Joi.string().optional(),
    logdate: Joi.date().optional(),
    appversion: Joi.string().optional(),
    apppage: Joi.string().optional(),
    source: Joi.string().optional()
  };

  return Joi.validate(errortrace, schema);
}

exports.errorTraceSchema = errorTraceSchema;
exports.Errortrace = Errortrace; 
exports.validate = validateErrortrace;