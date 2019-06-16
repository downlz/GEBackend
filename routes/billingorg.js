const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Billingorg,validate} = require('../models/billingorg'); 
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const billingorg = await Billingorg.find().sort('name');
  res.send(billingorg);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let orgObj = _.pick(req.body, ['name','email','pan','gstin','cin','isactive','orgtype']);
  
  let billingorg = new Billingorg(orgObj);
  billingorg = await billingorg.save();
  
  res.send(billingorg);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const billingorg = await Billingorg.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!billingorg) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(billingorg);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const billingorg = await Billingorg.findByIdAndRemove(req.params.id);

  if (!billingorg) return res.status(404).send('The genre with the given ID was not found.');

  res.send(billingorg);
});

router.get('/:id', async (req, res) => {
  const billingorg = await Billingorg.findById(req.params.id);

  if (!billingorg) return res.status(404).send('The genre with the given ID was not found.');

  res.send(billingorg);
});

module.exports = router;