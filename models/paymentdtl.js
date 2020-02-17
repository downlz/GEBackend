const Joi = require('joi');
const mongoose = require('mongoose');

const paymentDtlSchema = new mongoose.Schema({
  orderid: {type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},
  orderno: {
    type : String,
    required : true
  },
  referenceno : {
    type: String,
    default : null
  },
  requestedon :{
    type: Date,
    required: false
  },
  realisedon :{
    type: Date,
    required: false
  },
  status : {
    type : String,          
    required : false
  },
  mode :{
    type : String,
    required : false
  },
  lastupdateon :{
    type : Date,
    required : false
  }
});

const Paymentdtl = mongoose.model('Paymentdtl', paymentDtlSchema);

function validatePaymentDtl(paymentdtl) {
  const schema = {
    orderid: Joi.objectId(),
    orderno: Joi.string().optional(),
    referenceno: Joi.string().optional(),
    requestedon: Joi.date().optional(),
    realisedon: Joi.date().required(),
    status: Joi.status().optional(),
    mode: Joi.string().optional(),
    lastupdateon: Joi.date().optional(),
    // buildnumber: Joi.string().optional(),
  };

  return Joi.validate(paymentdtl, schema);
}

exports.paymentDtlSchema = paymentDtlSchema;
exports.Paymentdtl = Paymentdtl; 
exports.validate = validatePaymentDtl;