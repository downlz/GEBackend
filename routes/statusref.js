const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Statusref, validate} = require('../models/statusref');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const statusref = await Statusref.find();
  res.send(statusref);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let statusrefObj = _.pick(req.body, ['code','model','submodel','description']);
  statusrefObj.addedon = Date.now();

  let statusref = new Statusref(statusrefObj);
  statusref = await statusref.save();
  
  res.send(statusref);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  
  if (error) return res.status(400).send(error.details[0].message);
  let statusrefObj = _.pick(req.body, ['code','model','submodel','description']);
  
  const statusref = await Statusref.findByIdAndUpdate(req.params.id, statusrefObj, {
    new: true
  });

  if (!statusref) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(statusref);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const statusref = await Statusref.findByIdAndRemove(req.params.id);

  if (!statusref) return res.status(404).send('The genre with the given ID was not found.');

  res.send(statusref);
});

router.get('/:id', async (req, res) => {
  const statusref = await Statusref.findById(req.params.id);

  if (!statusref) return res.status(404).send('The genre with the given ID was not found.');

  res.send(statusref);
});

router.get('/model/:modelid/code/:codeid', async (req, res) => {
  const statusref = await Statusref.find({ $and : [{'model' : req.params.modelid},{'code' : req.params.codeid}]});

  if (!statusref) return res.status(404).send('The genre with the given ID was not found.');

  res.send(statusref);
});

module.exports = router;