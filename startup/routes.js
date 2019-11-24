const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser');
// const logger = require('./logger');
const users = require('../routes/users');
const addimage = require('../routes/addimage');
const testitem = require('../routes/testitem');
const items = require('../routes/items');
const orders = require('../routes/orders').router;
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
const transportrate = require('../routes/transportrate');
const dispatch = require('../routes/dispatchdtl');
const auction = require('../routes/auction');
const bid = require('../routes/bid');
const getinvoice = require('../routes/getinvoice');
const getpo = require('../routes/getpo');
const uploadbill = require('../routes/uploadbill');
const billingorg = require('../routes/billingorg');
const taxrates = require('../routes/taxrates');
const bargain = require('../routes/bargain');
const bankaccount = require('../routes/bankaccount');
const fcmnotifications = require('../routes/fcmnotifications');

var corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization,Origin,X-Requested-With,Accept',
  optionsSuccessStatus: 200
}

module.exports = function(app) {
  app.use(express.json());
  app.use(cors(corsOptions));
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
  app.use('/api/dispatch', dispatch);
  app.use('/api/referral', referral);
  app.use('/api/auction', auction);
  app.use('/api/bid', bid);
  app.use('/api/getinvoice', getinvoice);
  app.use('/api/getpo', getpo);
  app.use('/api/uploadbill', uploadbill);
  app.use('/api/billingorg', billingorg);
  app.use('/api/taxrates', taxrates);
  app.use('/api/bargain', bargain);
  app.use('/api/bankaccount',bankaccount);
  app.use('/api/fcmnotifications',fcmnotifications);
  app.use(error);
}
