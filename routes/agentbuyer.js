// Needs to completely done few requests are pending
const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {AgentBuyer, validate} = require('../models/agentbuyer');
const {User} = require('../models/user');
const {State} = require('../models/state');
const {City} = require('../models/city');

const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', [auth], async (req, res) => {
  const agentbuyer = await AgentBuyer.find().sort('text');
  res.send(agentbuyer);
});

router.post('/', [auth], async (req, res) => {
  const { error } = validate(req.body);
  console.log(error)
  if (error) return res.status(400).send(error.details[0].message);

  const city = await City.findById(req.body.city);
  if (!city) return res.status(400).send('Invalid city.');

  const state = await State.findById(req.body.state);
  if (!state) return res.status(400).send('Invalid state.');

  // const user = await User.findById(req.body.addedby);
  // if (!user) return res.status(400).send('Invalid User');

  let agentbuyerObj = _.pick(req.body, ['name','pin','addresstype','phone','partyname','addressbasicdtl','text']);
  partyObj = {
    partyname: agentbuyerObj.addressbasicdtl.partyname,
    gstin: agentbuyerObj.addressbasicdtl.gstin 
  }

  agentbuyerObj.phone = '+91'+agentbuyerObj.phone;
  agentbuyerObj.city =  city;
  agentbuyerObj.state = state;
  agentbuyerObj.addedby = req.body.addedby;
  agentbuyerObj.addressbasicdtl = partyObj;

  let agentbuyer = new AgentBuyer(agentbuyerObj);
  agentbuyer = await agentbuyer.save();

  res.send(agentbuyer);
});

router.put('/:id', [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const city = await City.findById(req.body.city);
  if (!city) return res.status(400).send('Invalid city.');

  const state = await State.findById(req.body.state);
  if (!state) return res.status(400).send('Invalid state.');


  const agentbuyer = await AgentBuyer.findByIdAndUpdate(req.params.id, { 
    text:text,
    city: city,
    state: state,
    pin: req.body.pin,
    addresstype: req.body.addresstype,
    phone: '+91'+req.body.phone,
    addedby: req.body.addedby
   }, {
    new: true
  });

  if (!agentbuyer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(agentbuyer);
});

router.delete('/:id', [auth, permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  const agentbuyer = await AgentBuyer.findByIdAndRemove(req.params.id);

  if (!agentbuyer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(agentbuyer);
});

router.get('/:id',[auth], async (req, res) => {
  const agentbuyer = await AgentBuyer.findById(req.params.id);

  if (!agentbuyer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(agentbuyer);
});

// Fetch all buyers added by agent
router.get('/byuser/:id',[auth], async (req, res) => {
  const agentbuyer = await AgentBuyer.find({ addedby : req.params.id}).sort('_id');
  
  if (!agentbuyer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(agentbuyer);
});

// Search by phone
router.get('/phone/:phone', async (req, res) => {
  const agentbuyer = await AgentBuyer.find({phone: req.params.phone});

  if (!agentbuyer) return res.status(404).send('The genre with the given ID was not found.');

  res.send(agentbuyer);
});
module.exports = router;
