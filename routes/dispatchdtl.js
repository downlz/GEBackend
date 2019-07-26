const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {DispatchDtl, validate} = require('../models/dispatchdtl');
// const mongoose = require('mongoose');
// const {City} = require('../models/city');
const {User} = require('../models/user');
const {dropIfDNE} = require('./orders');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {

  const dispatchdtl = await DispatchDtl.find();
  // console.log(dispatchdtl);

  res.send(dispatchdtl);
});

router.post('/', [auth, permit('admin','buyer','seller','transporter')], async (req, res) => {

  const { error } = validate(req.body);
  if (error) {
    console.log(error);
  }
  
  if (error) return res.status(400).send(error.details[0].message);
  
  // const from = await City.findById(req.body.fromId);
  // if (!from) return res.status(400).send('Invalid city.');

  // const to = await City.findById(req.body.toId);
  // if (!to) return res.status(400).send('Invalid city.');

  const user = await User.findById(req.body.addedby);
  if (!user) return res.status(400).send('Invalid User');

  let dispatchDtlObj = _.pick(req.body, ['orderno', 'vehicleno', 'vehicledtl','transportcost','dispatchtime', 'status', 'addedby']);
  dropIfDNE(dispatchDtlObj, ['orderno', 'vehicleno', 'vehicledtl', 'transportcost', 'dispatchtime', 'status', 'addedby']);
  
  // dispatchDtlObj.createdOn = Date();
  // dispatchDtlObj.from = from;
  // dispatchDtlObj.to = to;
  dispatchDtlObj.createdOn = Date();
  // dispatchDtlObj.isactive = true;

  let dispatchdtl = new DispatchDtl(dispatchDtlObj);
  dispatchdtl = await dispatchdtl.save();

  res.send(dispatchdtl);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  // console.log(req.body);
  // const { error } = validate(req.body);
  
  // if (error) return res.status(400).send(error.details[0].message);

  const dispatchdtl = await DispatchDtl.findByIdAndUpdate(req.params.id,
    { 
      status: req.body.status,
      lastUpdatedOn: Date()
    }, 
    {
    new: true
  });

  if (!dispatchdtl) return res.status(404).send('The dispatchdtl with the given ID was not found.');

  res.send(dispatchdtl);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const dispatchdtl = await DispatchDtl.findByIdAndRemove(req.params.id);

  if (!dispatchdtl) return res.status(404).send('The dispatchdtl with the given ID was not found.');

  res.send(dispatchdtl);
});

router.get('/:id', async (req, res) => {
  const dispatchdtl = await DispatchDtl.findById(req.params.id);

  if (!dispatchdtl) return res.status(404).send('The dispatchdtl with the given ID was not found.');

  res.send(dispatchdtl);
});

router.get('/user/:id', async (req, res) => {
  const dispatchdtl = await DispatchDtl.find({
    addedby: req.params.id
  })
  if (!dispatchdtl) return res.status(404).send('The dispatchdtl with the given ID was not found.');

  res.send(dispatchdtl);
});

module.exports = router;
