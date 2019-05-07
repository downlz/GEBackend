// Group Buying Listing made by admin
const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
//const {Order, validate} = require('../models/order');
const {GroupbuyingList, validate} = require('../models/gblist');
const {Item} = require('../models/item');
const {User} = require('../models/user');
const {Unit} = require('../models/unit');
const {Order} = require('../models/order');
const {Address, validateAddress} = require('../models/address');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

function dropIfDNE(Obj, arr) {
  for (var i = 0, size = arr.length; i < size ; i++) {
    if (!Obj[arr[i]]) delete Obj[arr[i]];
  }
}

router.get('/', async (req, res) => {
  const order = await GroupbuyingList.find().sort('gbstarttime');
  res.send(order);
});

router.post('/', [auth, permit('buyer', 'admin')],  async (req, res) => {

  const { error } = validate(req.body);
  // console.log(error);
  if (error) return res.status(400).send(error.details[0].message);

  const item = await Item.findById(req.body.itemId);
  if (!item) return res.status(400).send('Invalid Item.');

  const unit = await Unit.findById(req.body.unitId);
  if (!unit) return res.status(400).send('Invalid unit.');

  //
  // const address = await Address.findById(req.body.addressId);
  // if (!address) return res.status(400).send('Invalid address.');
  //
  // const buyer = await User.findById(req.body.buyerId);
  // if (!buyer) return res.status(400).send('Invalid buyer.');
  //
  // const seller = await User.findById(req.body.sellerId);
  // if (!seller) return res.status(400).send('Invalid seller.');


  let groupbuyingObj = _.pick(req.body, ['dealprice', 'moq', 'maxqty',      //Starttime and end time to be added after conversion
  'sampleno', 'totalqty', 'taxrate','remarks','gbstarttime','gbendtime']);
  dropIfDNE (groupbuyingObj, ['dealprice', 'moq', 'maxqty', 'sampleno', 'totalqty', 'taxrate','remarks','gbstarttime','gbendtime']);

  groupbuyingObj.item =  item;
  groupbuyingObj.unit = unit;

  let groupbuying = new GroupbuyingList(groupbuyingObj);
  groupbuying = await groupbuying.save();
  res.send(groupbuying)
});

router.put('/:id', [auth, permit('buyer', 'admin')], async (req, res) => {

  if (req.body.addressId) {
    const address = await Address.findById(req.body.addressId);
    if (!address) return res.status(400).send('Invalid category.');
  }


  let groupbuyingObj = _.pick(req.body, ['gbStartTime',
  'gbEndTime', 'dealPrice', 'moq', 'maxqty',
  'sampleNo', 'totalQty', 'taxRate','remarks']);

  if (req.body.addressId) {
    groupbuyingObj.address =  address;
  }

  const groupbuying = await GroupbuyingList.findByIdAndUpdate(req.params.id, groupbuyingObj, {
    new: true
  });

  if (!order) return res.status(404).send('The item with the given ID was not found.');

  res.send(order);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const groupbuying = await GroupbuyingList.findByIdAndRemove(req.params.id);

  if (!groupbuying) return res.status(404).send('The item with the given ID was not found.');

  res.send(groupbuying);
});

router.get('/:id', [auth], async (req, res) => {
  const groupbuying = await GroupbuyingList.findById(req.params.id);

  if (!groupbuying) return res.status(404).send('The item with the given ID was not found.');

  res.send(groupbuying);
});

router.get('/getqty/avl/:id', [auth], async (req, res) => {
  const groupbuying = await GroupbuyingList.findById(req.params.id);

  if (!groupbuying) return res.status(404).send('The item with the given ID was not found.');

  res.send(groupbuying);
});

router.get('/getqty/booked/:id', [auth], async (req, res) => {
  const groupbuying = await GroupbuyingList.findById(req.params.id);

  if (!groupbuying) return res.status(404).send('The item with the given ID was not found.');

  res.send(groupbuying);
});

router.get('/user/:id', [auth], async (req, res) => {
  // const order = await Order.findById(req.params.id);

  const customer = await User.findById(req.params.id);
  if (!customer) return res.status(400).send('Invalid buyer.');
  let order = null;
  if (customer.isSeller) {
    groupbuying = await GroupbuyingList.find({seller: customer}).sort({'gbstarttime':-1});
  }
  else {
    groupbuying = await GroupbuyingList.find({buyer: customer}).sort({'gbstarttime':-1});
  }

  if (!id) return res.status(404).send('The item with the given ID was not found for group buying');

  res.send(groupbuying);
});

module.exports = router;
