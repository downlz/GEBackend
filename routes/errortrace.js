const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Errortrace, validate} = require('../models/errortrace');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const errortrace = await Errortrace.find().sort({'logdate':-1})
  res.send(errortrace);
});

router.post('/', [auth], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let errortraceObj = _.pick(req.body, ['user','message','appversion','apppage','source']);
  errortraceObj.logdate = Date.now();
  let errortrace = new Errortrace(errortraceObj);
  errortrace = await errortrace.save();
  
  res.send(errortrace);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  let errortraceObj = _.pick(req.body, ['appversion','showbuyer','showseller','appname','packagename','buildnumber']);
  errortraceObj.releasedate = Date.now();
  const errortrace = await Errortrace.findByIdAndUpdate(req.params.id, errortraceObj, {
    new: true
  });

  if (!errortrace) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(errortrace);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const errortrace = await Errortrace.findByIdAndRemove(req.params.id);

  if (!errortrace) return res.status(404).send('The genre with the given ID was not found.');

  res.send(errortrace);
});

router.get('/:id', async (req, res) => {
  const errortrace = await Errortrace.findById(req.params.id);

  if (!errortrace) return res.status(404).send('The genre with the given ID was not found.');

  res.send(errortrace);
});

module.exports = router;