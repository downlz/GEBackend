const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {User} = require('../models/user');
const {Referral, validate} = require('../models/referral');
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
  const referrals = await Referral.find().sort('name');
  res.send(referrals);
});

router.post('/', [auth, permit('admin','buyer','seller')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.phone == await Referral.find({phone : req.body.phone})) {
      res.send({
        message : "User already exists"
      });
  } else {
      
  const referredby = await User.findById(req.body.referredby);
  if (!referredby) return res.status(400).send('Invalid Referree');

   let referralObj = _.pick(req.body, ['name','email','phone','referralcode']);
  
   dropIfDNE (referralObj, ['name','email','phone','referralcode']);

   referralObj.referredby = referredby;

  let referral = new Referral(referralObj);
  referral = await referral.save();
  res.send(referral);
  }
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const referral = await Referral.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!referral) return res.status(404).send('The genre with the given ID was not found.');

  res.send(referral);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const referral = await Referral.findByIdAndRemove(req.params.id);

  if (!referral) return res.status(404).send('The genre with the given ID was not found.');

  res.send(referral);
});

router.get('/:id', async (req, res) => {
  const referral = await Referral.findById(req.params.id);

  if (!referral) return res.status(404).send('The genre with the given ID was not found.');

  res.send(referral);
});

module.exports = router;