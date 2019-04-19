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
    type: Number,
    required: false
  },
  graincount: {
    type: Number,
    required: false
  },
  icumsa: {
    type: Number,
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
  unit: {
    type : unit.unitSchema,
    required: false
  },
  price: {
    type: Number,
    required: false
  },
  moisture: {
    type: Number,
    required: false
  },
  grainCount: {
    type: Number,
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
  manufacturer:{
    type: manufacturer.manufacturerSchema,
    required: true
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
    unitId: Joi.objectId().required(),
    price: Joi.number().required(),
    moisture: Joi.number().optional(),
    grainCount: Joi.number().optional(),
    grade: Joi.string().optional(),
    sampleNo: Joi.string().required(),
    cityId: Joi.objectId().required(),
    addressId: Joi.objectId().required(),
    sellerId: Joi.objectId().required(),
    origin: Joi.string().optional(),
    isLive: Joi.boolean().optional(),
    specs: Joi.object().optional(),
    manufacturerId: Joi.objectId().required()
  };

  return Joi.validate(item, schema);
}

exports.itemSchema = itemSchema;
exports.Item = Item;
exports.validate = validateItem;
