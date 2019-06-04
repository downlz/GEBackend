const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const {Address, validateAddress} = require('../models/address');
const {City} = require('../models/city');
const {State} = require('../models/state');
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

function dropIfDNE(Obj, arr) {
  for (var i = 0, size = arr.length; i < size ; i++) {
    if (!Obj[arr[i]]) delete Obj[arr[i]];
  }
}

router.get('/', [auth, permit('admin')], async (req, res) => {
  const user = await User.find().sort('name').select('-password');
  res.send(user);
});

router.get('/me', [auth], auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

router.post('/', async (req, res) => {

  userObj = _.pick(req.body, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1']);
  dropIfDNE (userObj, ['pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer', 'isEmpL0', 'isEmpL1']);
  // console.log(req.body);
  const { error } = validate(userObj);
  console.log(error);
  let user = await User.findOne({ phone: req.body.phone });
  if (user) return res.status(400).send('User already registered.');
  
  const city = await City.findById(req.body.cityId);
  if (!city) return res.status(400).send('Invalid city.');
  
  state = await State.findById(req.body.stateId);
  if (!state) return res.status(400).send('Invalid State');
  
  partyObj = {
    partyname: req.body.name,
    gstin: req.body.GST 
  }
  addressObj = {
    text: req.body.address,
    city: city,
    pin: req.body.pin,
    state: state,
    phone: req.body.phone,
    addresstype: 'registered',
    addressbasicdtl: partyObj,
  };

  const { errorAddr } = validateAddress(addressObj);
  console.log(errorAddr);
  if (errorAddr) return res.status(400).send(error.details[0].message);
  address = new Address(addressObj);
  await address.save();

  if (error) return res.status(400).send(error.details[0].message);
  console.log(error)
  user = new User(userObj);
  user.Addresses.push(address);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user.sellerFeePerKg = 0;
  user.buyerBackMarginPercent = 0;
  user.buyerCreditCostPercent = 0;
  user.buyerFeePerKg = 0;
  user.buyerNetLossPercent = 0;
  user.buyerMarginPerKg = 0;
  user.buyerDiscount1Percent = 0;
  user.buyerDiscount2PerKg = 0;
  user.buyerDiscount3Lumpsump = 0;
  user.buyerFinePerKg = 0;
  user.isSeller = false;

  await user.save();
  // Update user address 
  // console.log(addressid);
  // console.log(typeof(userid));
  // updatingAddr = await Address.updateOne({_id : addressid}, {$set: {addedby: userid,addresstype:'registered'}});
  // console.log(updatingAddr)
  // if (!updatingAddr) return res.status(404).send('The item with the given ID was not found.');
  //       res.send(user);
  //     } else {
  //       // console.log("No result")
  //       res.status(404).send({
  //         message :"No valid data found"
  //       });
  //     }

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'role']));
});

router.post('/resetpassword', async (req, res) => {
  passObj = _.pick(req.body, ['password', 'phone', 'pan', 'gstin']);

  user = new User(passObj);
  userpass = await User.find({$and :[{phone:req.body.phone},{pan:req.body.pan},{GST:req.body.gstin}]});
  
  if (userpass[0]){
      const salt = await bcrypt.genSalt(10);
      newpassword = await bcrypt.hash(req.body.password, salt); 
      user = await User.updateOne({_id : userpass[0]._id}, {$set: {password: newpassword}});
      
      if (!user) return res.status(404).send('The item with the given ID was not found.');
        res.send(user);
      } else {
        // console.log("No result")
        res.status(404).send({
          message :"No valid data found"
        });
    }
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {

  userObj = _.pick(req.body, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1']);
  //const { error } = validate(userObj);
  dropIfDNE (userObj, ['pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer', 'isEmpL0', 'isEmpL1']);

  user = await User.findByIdAndUpdate(req.params.id, userObj, {
    new: true
  });

  if (!user) return res.status(404).send('The item with the given ID was not found.');

  res.send(user);
});

router.put('/me', [auth], async (req, res) => {

  userObj = _.pick(req.body, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1']);
  //const { error } = validate(userObj);
  dropIfDNE (userObj, ['pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer', 'isEmpL0', 'isEmpL1']);

  user = await User.findByIdAndUpdate(req.user.id, userObj, {
    new: true
  });

  if (!user) return res.status(404).send('The item with the given ID was not found.');

  res.send(usr);

  // const city = await City.findById(req.body.cityId);
  // if (!city) return res.status(400).send('Invalid city.');

  // const address = await Address.findById(req.body.addressId);
  // if (!address) return res.status(400).send('Invalid address.');

  // addressObj = {
  //   text: req.body.address,
  //   city: city,
  //   pin: req.body.pin
  // };

  // const { errorAddr } = validateAddress(addressObj);
  // if (errorAddr) return res.status(400).send(error.details[0].message);
  // address = new Address(addressObj);
  // await address.save();

  // if (error) return res.status(400).send(error.details[0].message);

  // user = new User(userObj);
  // user.Addresses.push(address);
  // const salt = await bcrypt.genSalt(10);
  // user.password = await bcrypt.hash(user.password, salt);
  // await user.save();

  // const token = user.generateAuthToken();
  // res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'phone',
  // 'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'role']));
});

router.get('/seller', [auth, permit('admin')], async (req, res) => {                       //Check Security violation as auth is taken off
  const user = await User.find({"isSeller":true}).sort('name').select('-password');
  res.send(user);
});


router.get('/buyer', [auth, permit('admin')], async (req, res) => {
  const user = await User.find({"isBuyer":true}).sort('name').select('-password');
  res.send(user);
});

module.exports = router;
