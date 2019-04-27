const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser')

const users = require('../routes/users');
const addimage = require('../routes/addimage');
const testitem = require('../routes/testitem');
const items = require('../routes/items');
const orders = require('../routes/orders');
const gblisting = require('../routes/gblisting');
const city = require('../routes/city');
const state = require('../routes/state');
const address = require('../routes/address');
const manufacturer = require('../routes/manufacturer');
const itemName = require('../routes/itemname');
const categories = require('../routes/categories');
const auth = require('../routes/auth');
const price = require('../routes/price');
const error = require('../middleware/error');
const unit = require('../routes/unit');
const distance = require('../routes/distance');
const referral = require('../routes/referral');
const transportrate = require('../routes/transport-rate');
const auction = require('../routes/auction');
const getinvoice = require('../routes/getinvoice');
const getpo = require('../routes/getpo');


var corsOptions = {
  origin: 'http://localhost:4200'
}

module.exports = function(app) {
  app.use(express.json());
  app.use(cors(corsOptions))
  app.use('/api/user', users);
  app.use('/api/category', categories);
  app.use('/api/item', items);
  app.use('/api/order', orders);
  app.use('/api/gblisting',gblisting);
  app.use('/api/itemname', itemName);
  app.use('/api/city', city);
  app.use('/api/state', state);
  app.use('/api/address', address);
  app.use('/api/manufacturer', manufacturer);
  app.use('/api/auth', auth);
  app.use('/api/price', price);
  app.use('/api/addimage',addimage);
  app.use('/api/testitem',testitem);
  app.use('/api/unit', unit);
  app.use('/api/distance', distance);
  app.use('/api/transportrate', transportrate);
  app.use('/api/referral', referral);
  app.use('/api/auction', auction);
  app.use('/api/getinvoice', getinvoice);
  app.use('/api/getpo', getpo);
  app.use(error);
}
