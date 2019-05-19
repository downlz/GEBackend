const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/user');
const mongoose = require('mongoose');
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
  userInfo = { name: user.name, _id: user._id, isAdmin: user.isAdmin,
 	isBuyer: user.isBuyer, isSeller: user.isSeller, token: token  }
  res.send(userInfo);
});

function validate(req) {
  const schema = {
    phone: Joi.string().length(13).required(),
    password: Joi.string().min(8).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
