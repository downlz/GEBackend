const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Apppref, validate} = require('../models/apppref');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const apppref = await Apppref.find().sort({'releasedate':-1}).limit(1);
  res.send(apppref);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let appprefObj = _.pick(req.body, ['appversion','releasedate','showbuyer','showseller']);
  appprefObj.releasedate = Date.now();
  let apppref = new Apppref(appprefObj);
  apppref = await apppref.save();
  
  res.send(apppref);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  let appprefObj = _.pick(req.body, ['appversion','showbuyer','showseller']);
  appprefObj.releasedate = Date.now();
  const apppref = await Apppref.findByIdAndUpdate(req.params.id, appprefObj, {
    new: true
  });

  if (!apppref) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(apppref);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const apppref = await Apppref.findByIdAndRemove(req.params.id);

  if (!apppref) return res.status(404).send('The genre with the given ID was not found.');

  res.send(apppref);
});

router.get('/:id', async (req, res) => {
  const apppref = await Apppref.findById(req.params.id);

  if (!apppref) return res.status(404).send('The genre with the given ID was not found.');

  res.send(apppref);
});

module.exports = router;