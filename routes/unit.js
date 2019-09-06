const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Unit, validate} = require('../models/unit');
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const unit = await Unit.find().sort('mass');
  res.send(unit);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let unitObj = _.pick(req.body, ['mass']);

  let unit = new Unit(unitObj);
  unit = await unit.save();

  res.send(unit);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const unit = await Unit.findByIdAndUpdate(req.params.id, { mass: req.body.mass }, {
    new: true
  });

  if (!unit) return res.status(404).send('The unit with the given ID was not found.');

  res.send(unit);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const unit = await Unit.findByIdAndRemove(req.params.id);

  if (!unit) return res.status(404).send('The unit with the given ID was not found.');

  res.send(unit);
});

router.get('/:id', async (req, res) => {
  const unit = await Unit.findById(req.params.id);

  if (!unit) return res.status(404).send('The unit with the given ID was not found.');

  res.send(unit);
});

module.exports = router;
