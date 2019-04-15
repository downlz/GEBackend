const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
// const address = require('./address');
// const category = require('./category');
const item = require('./item');
const user = require('./user');
// const itemname = require('./itemname');
// const city = require('./city');

const groupbuyingSchema = new mongoose.Schema({
  item: {
    type: item.itemSchema,
    required: false
  },
 gbstarttime :{
   type: Date,
   required: false
 },
 gbendtime :{
   type: Date,
   required: false
 },
 dealprice :{
   type: Number,
   required: false
 },
 moq :{
   type: Number,
   required: false
 },
 maxcap :{
   type: Number,
   required: false
 },
 sampleno :{
   type: String,
   required: false
 },
 totalqty :{
   type: Number,
   required: false
 },
 taxrate :{
   type: Number,
   required: false
 },
 isactive: {
   type: Boolean,
   required: false
 },
 remarks: {
   type: String,
   required: false
 }
});

const GroupbuyingList = mongoose.model('GroupBuying', groupbuyingSchema);

function validateGBlist(gblist) {
  const schema = {
    itemId: Joi.objectId().required(),
    gbstarttime: Joi.string().optional(),
    gbendtime: Joi.objectId().optional(),
    dealprice: Joi.number().required(),
    moq: Joi.number().required(),
    maxcap: Joi.number().optional(),
    sampleno: Joi.string().optional(),
    totalqty: Joi.string().optional(),
    taxrate: Joi.string().required(),
    isactive: Joi.string().optional(),
    remarks: Joi.string().optional(),
  };

  return Joi.validate(gblist, schema);
}

exports.groupbuyingSchema = groupbuyingSchema;
exports.GroupbuyingList = GroupbuyingList;
exports.validate = validateGBlist;
