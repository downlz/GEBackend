const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const address = require('./address');
const category = require('./category');
const manufacturer = require('./manufacturer');
const unit = require('./unit');
const user = require('./user');
const itemname = require('./itemname');
const city = require('./city');


const itemspecSchema = new mongoose.Schema({
  moisture: {
    type: String,
    required: false
  },
  graincount: {
    type: String,
    required: false
  },
  icumsa: {
    type: String,
    required: false
  }
});

const itemSchema = new mongoose.Schema({
  name: {
    type: itemname.itemnameSchema,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  category: {
    type: category.categorySchema,
    required: false
  },
  specs: {
    type : itemspecSchema,
    required: false
  },
  qty: {
    type: Number,
    required: false
  },
  bargaintrgqty: {
    type: Number,
    required: false
  },
  bargainenabled: {
    type: Boolean,
    required: false,
    default : false
  },
  unit: {
    type : unit.unitSchema,
    required: false
  },
  price: {
    type: Number,
    required: false
  },
  moisture: {
    type: String,
    required: false
  },
  grainCount: {
    type: String,
    required: false
  },
  grade: {
    type: String,
    required: false
  },
  sampleNo: {
    type: String,
    unique : true,
    required: false
  },
  city: {
    type: city.citySchema,
    required: false
  },
  address: {
    type: address.addressSchema,
    required: false
  },
  seller: {
    type: user.userSchema,
    required: false
  },
  origin: {
    type: String,
    required: false
  },
  isLive: {
    type: Boolean,
    required: false
  },
  isTaxable: {
    type: Boolean,
    required: false,
    default: true
  },
  manufacturer:{
    type: manufacturer.manufacturerSchema,
    required: true,
  },
  addedby : {
    type: user.userSchema,
    required: false
  },
  updatedon :{
    type : Date,
    required : false
  },
  remarks :{
    type : String,
    required: false
  }
  // },
  // saletype: {
  //   type: String,
  //   enum: ['auction', 'bid', 'normal', 'groupbuying'],
  //   required: false
  // }
});

const Item = mongoose.model('Item', itemSchema);

function validateItem(item) {
  const schema = {
    nameId: Joi.objectId().required(),
    image: Joi.string().required(),
    categoryId: Joi.objectId().required(),
    qty: Joi.number().required(),
    bargaintrgqty: Joi.number().optional(),
    bargainenabled: Joi.boolean().optional(),
    unitId: Joi.objectId().required(),
    price: Joi.number().required(),
    moisture: Joi.string().optional(),
    grainCount: Joi.string().optional(),
    grade: Joi.string().optional(),
    sampleNo: Joi.string(),
    cityId: Joi.objectId().required(),
    addressId: Joi.objectId().required(),
    sellerId: Joi.objectId().required(),
    origin: Joi.string().optional(),
    isLive: Joi.boolean().optional(),
    isTaxable: Joi.boolean().optional(),
    addedby : Joi.objectId().required(),
    specs: Joi.object().optional(),
    manufacturerId: Joi.objectId().required(),
    updatedon : Joi.string.optional(),
    remarks : Joi.string.optional()
  };

  return Joi.validate(item, schema);
}

exports.itemSchema = itemSchema;
exports.Item = Item;
exports.validate = validateItem;
