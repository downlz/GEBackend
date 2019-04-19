const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {User, validate} = require('../models/user');
const {Referral, validate} = require('../models/referral');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const referrals = await Referral.find().sort('name');
  res.send(referrals);
});

router.post('/', [auth, permit('admin','buyer','seller')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const referredby = await User.findById(req.body.userId);
  if (!referredby) return res.status(400).send('Invalid Referree');

   let referralObj = _.pick(req.body, ['name']);
   referralObj.itemname = itemName;

  let referral = new Referral(referralObj);
  referral = await referral.save();
  res.send(referral);
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
