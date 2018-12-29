const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Item, validate} = require('../models/item');
const {Category} = require('../models/category'); 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const item = await Item.find().sort('name');
  res.send(item);
});

router.post('/',  async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const category = await Category.findOne({ name: req.body.category.name });
  if (!category) return res.status(400).send('Invalid customer.');

  itemObj = _.pick(req.body, ['name', 'image', 
  'qty', 'moisture', 'grainCount', 'grade', 'sampleNo']);

  itemObj.category =  category
  let item = new Item(itemObj);
  item = await item.save();
  
  res.send(item);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send('Invalid customer.');

  const itemSubObj = _.pick(req.body, ['name', 'image', 
  'qty', 'moisture', 'grainCount', 'grade', 'sampleNo',
  'location'])

  const categoryObj = {
    _id: category._id,
    name: category.name,
  }

  const itemObj = _.assign({}, itemObj, categoryObj);
  const item = await Item.findByIdAndUpdate(req.params.id, itemObj, {
    new: true
  });

  if (!item) return res.status(404).send('The item with the given ID was not found.');
  
  res.send(item);
});

router.delete('/:id', async (req, res) => {
  const item = await Item.findByIdAndRemove(req.params.id);

  if (!item) return res.status(404).send('The item with the given ID was not found.');

  res.send(item);
});

router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) return res.status(404).send('The item with the given ID was not found.');

  res.send(item);
});

module.exports = router;