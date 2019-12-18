const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Banner, validate} = require('../models/banner');
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const banner = await Banner.find().sort('id');
  res.send(banner);
});

router.post('/', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let bannerObj = _.pick(req.body, ['id','imageUrl']);

  let banner = new Banner(bannerObj);
  banner = await banner.save();
  
  res.send(banner);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const banner = await Banner.findByIdAndUpdate(req.params.id, { id: req.body.id , code: req.body.imageUrl}, {
    new: true
  });

  if (!banner) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(banner);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const banner = await Banner.findByIdAndRemove(req.params.id);

  if (!banner) return res.status(404).send('The genre with the given ID was not found.');

  res.send(banner);
});

router.get('/:id', async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) return res.status(404).send('The genre with the given ID was not found.');

  res.send(banner);
});

module.exports = router;