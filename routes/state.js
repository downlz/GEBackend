const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {State, validate} = require('../models/state');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const state = await State.find().sort('name');
  res.send(state);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let state = new State({ name: req.body.name });
  state = await state.save();
  
  res.send(state);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const state = await State.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!state) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(state);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const state = await State.findByIdAndRemove(req.params.id);

  if (!state) return res.status(404).send('The genre with the given ID was not found.');

  res.send(state);
});

router.get('/:id', async (req, res) => {
  const state = await State.findById(req.params.id);

  if (!state) return res.status(404).send('The genre with the given ID was not found.');

  res.send(state);
});

module.exports = router;