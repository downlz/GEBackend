const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Category, validate} = require('../models/category');
const {ItemName} = require('../models/itemname');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const state = await Category.find().sort('name');
  res.send(state);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const itemName = await ItemName.findById(req.body.itemnameId);
  if (!itemName) return res.status(400).send('Invalid Item name.');

   let categoryObj = _.pick(req.body, ['name']);
  categoryObj.itemname = itemName;

  let category = new Category(categoryObj);
  category = await category.save();
  res.send(category);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!category) return res.status(404).send('The genre with the given ID was not found.');

  res.send(category);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);

  if (!category) return res.status(404).send('The genre with the given ID was not found.');

  res.send(category);
});

router.get('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) return res.status(404).send('The genre with the given ID was not found.');

  res.send(category);
});

module.exports = router;
