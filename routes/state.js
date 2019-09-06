const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {State, validate} = require('../models/state');
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const state = await State.find().sort('name');
  res.send(state);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let stateObj = _.pick(req.body, ['name','code']);

  let state = new State(stateObj);
  state = await state.save();
  
  res.send(state);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const state = await State.findByIdAndUpdate(req.params.id, { name: req.body.name , code: req.body.code}, {
    new: true
  });

  if (!state) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(state);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
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