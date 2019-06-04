const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
// const address = require('./address');
// const category = require('./category');
const item = require('./item');
const user = require('./user');
const unit = require('./unit');
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
 maxqty :{
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
 unit :{
   type : unit.unitSchema,
   required: true
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
    gbendtime: Joi.string().optional(),
    dealprice: Joi.number().required(),
    moq: Joi.number().required(),
    maxqty: Joi.number().optional(),
    sampleno: Joi.string().optional(),
    totalqty: Joi.string().required(),
    unitId: Joi.objectId().required(),
    taxrate: Joi.string().required(),
    isactive: Joi.boolean().optional(),
    remarks: Joi.string().optional(),
  };

  return Joi.validate(gblist, schema);
}

exports.groupbuyingSchema = groupbuyingSchema;
exports.GroupbuyingList = GroupbuyingList;
exports.validate = validateGBlist;
