const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {TransportRate, validate} = require('../models/transport-rate');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {

  const transportrate = await TransportRate.find();
  console.log(transportrate);

  res.send(transportrate);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let transportRateObj = _.pick(req.body, ['name','vehicletype','capacity','rate']);

  let transportrate = new TransportRate(transportRateObj);
  transportrate = await transportrate.save();

  res.send(transportrate);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const transportrate = await TransportRate.findByIdAndUpdate(req.params.id, { rate: req.body.rate,name: req.body.name,vehicletype: req.body.vehicletype }, {
    new: true
  });

  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const transportrate = await TransportRate.findByIdAndRemove(req.params.id);

  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

router.get('/:id', async (req, res) => {
  const transportrate = await TransportRate.findById(req.params.id);

  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

module.exports = router;
