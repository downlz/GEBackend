const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Distance, validate} = require('../models/distance');
const {City} = require('../models/city');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/from/:fromId/to/:toId', async (req, res) => {                      // Returns distace between two points
  var fromId = req.params.fromId // .toString();
  var toId = req.params.toId

  // console.log(allocId);

  const distance = await Distance.findOne({ "from._id" : fromId, "to._id" : toId });
  console.log(distance.distance);

  res.send(distance);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const from = await City.findById(req.body.fromId);
  if (!from) return res.status(400).send('Invalid City.');

  const to = await City.findById(req.body.toId);
  if (!to) return res.status(400).send('Invalid City.');

  let distanceObj = _.pick(req.body, ['distance']);

  distanceObj.from =  from;
  distanceObj.to =  to;

  let distance = new Distance(distanceObj);
  distance = await distance.save();

  res.send(distance);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const distance = await Distance.findByIdAndUpdate(req.params.id, { distance: req.body.distance }, {
    new: true
  });

  if (!distance) return res.status(404).send('The distance with the given ID was not found.');

  res.send(distance);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const distance = await Distance.findByIdAndRemove(req.params.id);

  if (!distance) return res.status(404).send('The distance with the given ID was not found.');

  res.send(distance);
});

router.get('/:id', async (req, res) => {                                          // Returns distance object for a ID
  const distance = await Distance.findById(req.params.id);

  if (!distance) return res.status(404).send('The distance with the given ID was not found.');

  res.send(distance);
});

module.exports = router;
