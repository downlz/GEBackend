const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {ItemName, validate} = require('../models/itemname');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const itemName = await ItemName.find().sort('name');
  res.send(itemName);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let itemNameObj = _.pick(req.body, ['name','hsn','image','tax']);
  // itemNameObj.tax = 0;
  itemNameObj.insurance = 0;

  let itemName = new ItemName(itemNameObj);
  itemName = await itemName.save();
  
  res.send(itemName);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  
  // const { error } = validate(req.body); 
  // console.log(error)
  let itemNameObj = _.pick(req.body, ['name','hsn','tax']);
  
  // if (error) return res.status(400).send(error.details[0].message);

  const itemName = await ItemName.findByIdAndUpdate(req.params.id, itemNameObj, {
    new: true
  });

  if (!itemName) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(itemName);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const itemName = await ItemName.findByIdAndRemove(req.params.id);

  if (!itemName) return res.status(404).send('The genre with the given ID was not found.');

  res.send(itemName);
});

router.get('/:id', async (req, res) => {
  const itemName = await ItemName.findById(req.params.id);

  if (!itemName) return res.status(404).send('The genre with the given ID was not found.');

  res.send(itemName);
});

module.exports = router;