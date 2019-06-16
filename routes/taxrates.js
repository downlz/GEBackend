const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Taxrate, validate} = require('../models/taxrates');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const taxrate = await Taxrate.find().sort('type');
  res.send(taxrate);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let taxrateObj = _.pick(req.body, ['type','ratepct','startdate','enddate','finyear','assessmentyear']);

  let taxrate = new Taxrate(taxrateObj);
  taxrate = await taxrate.save();
  
  res.send(taxrate);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const taxrate = await Taxrate.findByIdAndUpdate(req.params.id, { name: req.body.name , code: req.body.code}, {
    new: true
  });

  if (!taxrate) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(taxrate);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const taxrate = await Taxrate.findByIdAndRemove(req.params.id);

  if (!taxrate) return res.status(404).send('The genre with the given ID was not found.');

  res.send(taxrate);
});

router.get('/:id', async (req, res) => {
  const taxrate = await Taxrate.findById(req.params.id);

  if (!taxrate) return res.status(404).send('The genre with the given ID was not found.');

  res.send(taxrate);
});

module.exports = router;