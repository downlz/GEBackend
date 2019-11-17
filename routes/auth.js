const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/user');
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ phone: req.body.phone });
  if (!user) return res.status(400).send('Invalid phone or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');
  
  const token = user.generateAuthToken();
  usertype = req.body.usertype;
  // Add here logic to change user type based on details shared in login form
  userInfo = { name: user.name, _id: user._id, isAdmin: user.isAdmin,
   isBuyer: user.isBuyer, isSeller: user.isSeller, isTransporter: user.isTransporter,
   isAgent: user.isAgent, isNbfc: user.isNbfc, isBank: user.isBank,
   isActive: user.isactive, token: token, phone: user.phone,
   fcmkey: user.fcmkey, devicedtl: user.devicedtl
   }
   if (userInfo.isTransporter == true || userInfo.isAdmin == true ) {
          // User profile cannot be overridden
   } else {
   if ( usertype == 'Seller' ) {
    // userInfo.isSeller = false
    // userInfo.isSeller = true
    userInfo.isSeller = true
    userInfo.isBuyer = false
    userInfo.isAgent = false
    userInfo.isTransporter = false
   } else if (usertype == 'Buyer' ) {
    userInfo.isSeller = false
    userInfo.isBuyer = true
    userInfo.isAgent = false
    userInfo.isTransporter = false
   } else if (usertype == 'Partner' ) {
    // userInfo.isSeller = 
    userInfo.isSeller = false
    userInfo.isBuyer = false
    userInfo.isAgent = true
    userInfo.isTransporter = false
   } else {
    // Do nothing, No changes to profile needed
  }
}
  res.send(userInfo);
});

function validate(req) {
  const schema = {
    phone: Joi.string().length(13).required(),
    password: Joi.string().min(8).max(255).required(),
    usertype: Joi.string().max(12),
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
