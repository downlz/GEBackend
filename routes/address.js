// Needs to completely done few requests are pending
const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Address, validate} = require('../models/address');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', [auth], async (req, res) => {
  const address = await Address.find().sort('text');
  res.send(address);
});

router.post('/', [auth], async (req, res) => {
  const { error } = validate(req.body);
  console.log(error)
  if (error) return res.status(400).send(error.details[0].message);

  const city = await City.findById(req.body.cityId);
  if (!city) return res.status(400).send('Invalid city.');

  let addressObj = _.pick(req.body, ['text','pin']);

  itemObj.city =  city;

  let address = new Address(addressObj);
  address = await address.save();

  res.send(address);
});

router.put('/:id', [auth, permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const address = await Address.findByIdAndUpdate(req.params.id, { name: req.body.text }, {
    new: true
  });

  if (!address) return res.status(404).send('The genre with the given ID was not found.');

  res.send(address);
});

router.delete('/:id', [auth, permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  const address = await Address.findByIdAndRemove(req.params.id);

  if (!address) return res.status(404).send('The genre with the given ID was not found.');

  res.send(address);
});

router.get('/:id',[auth], async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) return res.status(404).send('The genre with the given ID was not found.');

  res.send(address);
});

// This is to pull list of all active address associated with user
router.get('/byuser/:id/phone/:phone',[auth], async (req, res) => {
  const address = await Address.find({ $or : [{addedby : req.params.id},{phone: req.params.phone}]});

  if (!address) return res.status(404).send('The genre with the given ID was not found.');

  res.send(address);
});

// Get user registered address
router.get('/phone/:phone', async (req, res) => {
  const address = await Address.find({ $and : [{addresstype : 'registered'},{phone: req.params.phone}]});

  if (!address) return res.status(404).send('The genre with the given ID was not found.');

  res.send(address);
});
module.exports = router;
