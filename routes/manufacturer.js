const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Manufacturer, validate} = require('../models/manufacturer');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const state = await Manufacturer.find().sort('name');
  res.send(state);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let manufacturerObj = _.pick(req.body, ['name','address','phone','email']);

  let manufacturer = new Manufacturer(manufacturerObj);
  manufacturer = await manufacturer.save();

  res.send(manufacturer);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const manufacturer = await Manufacturer.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!manufacturer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(manufacturer);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const manufacturer = await Manufacturer.findByIdAndRemove(req.params.id);

  if (!manufacturer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(manufacturer);
});

router.get('/:id', async (req, res) => {
  const manufacturer = await Manufacturer.findById(req.params.id);

  if (!manufacturer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(manufacturer);
});

module.exports = router;
