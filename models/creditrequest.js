const Joi = require("joi");
const mongoose = require("mongoose");
Joi.objectId = require('joi-objectid')(Joi);

const creditRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  addressline: {
    type: String,
    required: false
  },
  city: {type: mongoose.Schema.Types.ObjectId, ref: 'City', required: false},
  state: {type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false}, 
  pin: {
    type: String,
    required: false, 
    minlength: 6,
    maxlength: 6
  },
  phone : {
    type : String,
    required : true
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false},
  annualturnover : {
    type : Number,
    required : true
  },
  lastthreeturnovr: {
    type : Number,
    required : false
  },
  tradeitems : {
    type : String,
    required : false
  },
  requestedon : {
    type : Date,
    required : false
  },
  status : {
    type : String,
    required : false,
    enum : ['submitted','proposed','accepted','rejected','pending','awaiting','withdrawn','cancelled']
  },
  remarks :{
    type : String
  },
  requestno : {
    type : String,
    required : false
  },
  lastupdated : {
    type :  Date,
    required : false
  }

});

const CreditRequest = mongoose.model('CreditRequest', creditRequestSchema);

function validateCreditRequest(creditrequest) {
  const schema = {
    name: Joi.string().optional(),
    addressline : Joi.string(),
    city: Joi.objectId(),
    state: Joi.objectId(),
    pin: Joi.string().min(6).max(6).optional(),
    phone: Joi.string().required(),
    user : Joi.objectId(),
    annualturnover : Joi.number().required(),
    lastthreeturnovr : Joi.number(),
    tradeitems : Joi.string().required(),
    requestedon : Joi.string(),
    status : Joi.string(),
    remarks : Joi.string(),
    requestno : Joi.string(),
    lastupdated : Joi.string()
  };

  return Joi.validate(creditrequest, schema);
}

exports.creditRequestSchema = creditRequestSchema;
exports.CreditRequest = CreditRequest; 
exports.validate = validateCreditRequest;