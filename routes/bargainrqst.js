const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {BargainRqst, validate} = require('../models/bargainrsqt');
const {Item} = require('../models/item');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const bargainrqst = await BargainRqst.find().sort('lastupdated');
  res.send(bargainrqst);
});


router.post('/', [auth, permit('admin')], async (req, res) => {
  
  // const { error } = validate(req.body); 
  // console.log(error);
  // if (error) return res.status(400).send(error.details[0].message);
  
  
  const itemdtl = await Item.findById(req.body.itemId);
  if (!itemdtl) return res.status(400).send('Invalid item.');

  // console.log(item);

  const buyerid = await User.findById(req.body.buyerId);
  if (!buyerid) return res.status(400).send('Invalid Buyer');

  const sellerid = await User.findById(itemdtl.seller._id);
  if (!sellerid) return res.status(400).send('Invalid Seller');

  let bargainObj = _.pick(req.body, ['buyerquote']);      // Creating a bargain object

  
  quoteObj = {
    requestedon : Date(),
    buyerquote : bargainObj.buyerquote,
    sellerquote : '',
    status : 'placed'
  }

  bargainObj.bargainstatus = 'placed';
  bargainObj.lastupdated = Date();
  bargainObj.firstquote = quoteObj;
  bargainObj.item = itemdtl;
  bargainObj.buyer = buyerid;
  bargainObj.seller = sellerid;
  
  let bargainrqst = new BargainRqst(bargainObj);
  bargainrqst = await bargainrqst.save();
  
  res.send(bargainrqst);

});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const city = await City.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!city) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(city);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const city = await City.findByIdAndRemove(req.params.id);

  if (!city) return res.status(404).send('The genre with the given ID was not found.');

  res.send(city);
});

router.get('/:id', async (req, res) => {
  const city = await City.findById(req.params.id);

  if (!city) return res.status(404).send('The genre with the given ID was not found.');

  res.send(city);
});

module.exports = router;