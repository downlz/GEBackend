const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {TransportRate, validate} = require('../models/transportrate');
// const mongoose = require('mongoose');
const {City} = require('../models/city');
const {User} = require('../models/user');
const {dropIfDNE} = require('./orders');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {

  const transportrate = await TransportRate.find().sort('from.name');
  // console.log(transportrate);

  res.send(transportrate);
});

router.post('/', [auth] , async (req, res) => { // permit('admin', 'transporter')],

  const { error } = validate(req.body);
  if (error) {
    console.log(error);
  }
  
  if (error) return res.status(400).send(error.details[0].message);
  
  const from = await City.findById(req.body.fromId);
  if (!from) return res.status(400).send('Invalid city.');

  const to = await City.findById(req.body.toId);
  if (!to) return res.status(400).send('Invalid city.');

  const user = await User.findById(req.body.addedby);
  if (!user) return res.status(400).send('Invalid User');

  let transportRateObj = _.pick(req.body, ['capacity', 'tonnagein', 'duration', 'pricequote','vehicledtl' ]);
  dropIfDNE(transportRateObj, ['capacity', 'tonnagein', 'duration', 'pricequote', 'vehicledtl']);
  
  transportRateObj.createdOn = Date();
  transportRateObj.from = from;
  transportRateObj.to = to;
  transportRateObj.addedby = user;
  transportRateObj.isactive = true;

  let transportrate = new TransportRate(transportRateObj);
  transportrate = await transportrate.save();

  res.send(transportrate);
});

router.put('/:id', [auth], async (req, res) => {
  // console.log(req.body);
  // const { error } = validate(req.body);
  
  // if (error) return res.status(400).send(error.details[0].message);

  const transportrate = await TransportRate.findByIdAndUpdate(req.params.id, 
    { 
      duration: req.body.duration,
      pricequote: req.body.pricequote,
      vehicledtl: req.body.vehicledtl,
      isactive: req.body.isactive,
      lastUpdatedOn: Date()
    }, 
    {
    new: true
  });

  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const transportrate = await TransportRate.findByIdAndRemove(req.params.id);

  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

router.get('/:id', async (req, res) => {
  const transportrate = await TransportRate.findById(req.params.id);

  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

router.get('/user/:id', async (req, res) => {
  const transportrate = await TransportRate.find({
    'addedby._id': req.params.id
  }).sort('from');
  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

router.get('/source/:src/destination/:destn', async (req, res) => {
  const transportrate = await TransportRate.find({ $and : [
    {'from._id': req.params.src},
    {'to._id' : req.params.destn}]
  }).sort('from.name');
  if (!transportrate) return res.status(404).send('The transportrate with the given ID was not found.');

  res.send(transportrate);
});

module.exports = router;
