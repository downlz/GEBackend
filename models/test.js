const Joi = require('joi');
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name : {type : String,required : true},
    aadharno : {type : Number,required : true,unique : true}
  })

exports.testSchema = testSchema;
