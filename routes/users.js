const auth = require('../middleware/auth');
// const logger = require('../startup/logger');
const permit = require('../middleware/permissions');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const sendEmail = require('../middleware/sendemail');
const {Address, validateAddress} = require('../models/address');
const {City} = require('../models/city');
const {State} = require('../models/state');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

function dropIfDNE(Obj, arr) {
  for (var i = 0, size = arr.length; i < size ; i++) {
    if (!Obj[arr[i]]) delete Obj[arr[i]];
  }
}

router.get('/', [auth], async (req, res) => {
  const user = await User.find().sort('name').select('-password');
  res.send(user);
});

router.get('/me', [auth], async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

// router.get('/:id', [auth], async (req, res) => {
  // if (!mongoose.Types.ObjectId.isValid(req.params.id))
// return res.status(404).send('Invalid ID.');
//   const user = await User.findById(req.params.id).select('-password');
//   res.send(user);
// });



router.post('/', async (req, res) => {

  userObj = _.pick(req.body, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1', 'isTransporter','isAgent', 'isNbfc', 'isBank']);
  dropIfDNE(userObj, ['pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer', 'isEmpL0', 'isEmpL1', 
                    'isAgent', 'isNbfc', 'isBank', 'isTransporter']);
  
  const { error } = validate(userObj);
  // logger.error(error);
  // console.log(error);
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

  // const { errorAddr } = validateAddress(addressObj);
  // console.log(errorAddr);
  // if (errorAddr) return res.status(400).send(error.details[0].message);
  address = new Address(addressObj);
  if (error) return res.status(400).send(error.details[0].message);
  // console.log(error)
  user = new User(userObj);
  user.Addresses = []
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

  await address.save();   //Save address once user profile is saved

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
        res.status(404).send({
          message :"No valid data found"
        });
    }
});

router.put('/:id', [auth], async (req, res) => {

  const useremail = await User.findById(req.params.id);
  if (!useremail) return res.status(400).send('Invalid User.');

  userObj = _.pick(req.body, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1', 'isTransporter','isAgent','isNbfc','isBank','vendorCode','isactive','devicedtl','fcmkey']);

  dropIfDNE(userObj, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1', 'isTransporter','isAgent','isNbfc','isBank','vendorCode','isactive','devicedtl','fcmkey']);
  
  user = await User.findByIdAndUpdate(req.params.id, userObj, {
    new: true
  });

  if (!user) return res.status(404).send('The item with the given ID was not found.');

  var message = `<p>Dear User,</p>
        <p>Thank you for registration on GrainEasy.<br>
        Your account has been successfully activated.You can now login to the application and explore products,place orders and do much more.<br>
        Please feel free to reach out to us on trade@graineasy.com for any clarification.
        <br><br>
        Regards,<br>
        Graineasy
        </p>`
    var emailsubject;
    emailsubject = 'Graineasy account Activated'
    if (userObj.isactive == true){
      sendEmail(useremail.email, process.env.EMAILCCUSER, process.env.EMAILBCCUSER,emailsubject, message);
    }

  res.send(user);
});

router.put('/me', [auth], async (req, res) => {

  userObj = _.pick(req.body, ['name', 'email', 'password', 'phone',
  'pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer',
  'isEmpL0', 'isEmpL1', 'isTransporter','isAgent','isNbfc','isBank','vendorCode','isactive']);
  //const { error } = validate(userObj);
  dropIfDNE(userObj, ['pan', 'GST', 'PocName', 'PocPhone', 'PocEmail', 'isSeller', 'isBuyer', 'isEmpL0', 'isEmpL1',
          'isAgent', 'isNbfc', 'isBank', 'isTransporter','isAgent','isNbfc','isBank','vendorCode','isactive']);

  user = await User.findByIdAndUpdate(req.user.id, userObj, {
    new: true
  });

  if (!user) return res.status(404).send('The item with the given ID was not found.');

  res.send(usr);

});


router.get('/seller',[auth], async (req, res) => {   
  const user = await User.find({ $and : [{"isSeller":true},{"isactive":true}]}).sort('name').select('-password');
  res.send(user);
});


router.get('/buyer', [auth, permit('admin', 'buyer', 'agent')], async (req, res) => {
  const user = await User.find({"isBuyer":true}).sort('name').select('-password');
  res.send(user);
});

router.get('/agent', [auth, permit('admin', 'agent')], async (req, res) => {
  const user = await User.find({"isAgent":true}).sort('name').select('-password');
  res.send(user);
});

router.get('/transporter', [auth, permit('admin', 'transporter', 'agent')], async (req, res) => {
  const user = await User.find({
    "isTransporter": true
  }).sort('name').select('-password');
  res.send(user);
});

module.exports = router;
