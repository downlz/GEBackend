const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Bargain, validate} = require('../models/bargain');
const {Item} = require('../models/item');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const bargain = await Bargain.find().sort('lastupdated');
  res.send(bargain);
});


router.post('/', [auth, permit('admin','buyer')], async (req, res) => {
  
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

  let bargainObj = _.pick(req.body, ['buyerquote','quantity']);      // Creating a bargain object

  quoteObj = {
    requestedon : Date(),
    buyerquote : bargainObj.buyerquote,
    sellerquote : '',
    status : 'placed'
  }

  bargainObj.bargainstatus = 'placed';
  bargainObj.bargaincounter = 1;
  bargainObj.lastupdated = Date();
  bargainObj.firstquote = quoteObj;
  bargainObj.item = itemdtl;
  bargainObj.buyer = buyerid;
  bargainObj.seller = sellerid;

  
  // Verify here is any active bargain in place or not.

  const activebargain = await Bargain.find({$and : [{'item._id': itemdtl._id},{'buyer._id':buyerid._id},{ bargainstatus: { $nin: [ 'negotiation', 'placed','paused' ] } }]}); // Add rule for datetime
   
  // if (!activebargain[0]){
    // console.log('Do Nothing')
  // } else {
    let bargain = new Bargain(bargainObj);
    bargain = await bargain.save();
  // }
  
  res.send(bargain);

});

router.put('/:id', [auth, permit('admin','buyer','seller')], async (req, res) => {
  
  const bargain = await Bargain.findById(req.params.id);

  var bargainObj = _.pick(req.body, ['buyerquote','sellerquote']);
  if (req.body.buyerquote) {
    switch (bargain.bargaincounter) {
      case 1:
        break ;
        // Do nothing as buyer placecs a bid first which is handled in first req
      case 2:
          if (req.body.action == 'accepted') {
            quoteObj = {
              requestedon : bargain.firstquote.requestedon,
              buyerquote : bargain.firstquote.buyerquote,
              sellerquote : bargain.firstquote.sellerquote,
              status : 'accepted'
            }
            bargainObj.bargainstatus = 'accepted'
            bargainObj.lastupdated = Date()
            bargainObj.quoteObj = quoteObj
           } else if (req.body.action == 'rejected') {
            quoteObj = {
              requestedon : bargain.firstquote.requestedon,
              buyerquote : bargain.firstquote.buyerquote,
              sellerquote : bargain.firstquote.sellerquote,
              status : 'rejected'
            }
            bargainObj.bargainstatus = 'rejected'
            bargainObj.lastupdated = Date()
            bargainObj.firstquote = quoteObj
           } else {
            quoteObj = {
              requestedon : Date(),
              buyerquote : req.body.buyerquote,
              status : 'countered'
            }
            bargainObj.bargainstatus = 'negotiation'
            bargainObj.lastupdated = Date()
            bargainObj.secondquote = quoteObj
            }
            break;
      case 3:
          if (req.body.action == 'accepted') {
            quoteObj = {
              requestedon : bargain.secondquote.requestedon,
              buyerquote : bargain.secondquote.buyerquote,
              sellerquote : bargain.secondquote.sellerquote,
              status : 'accepted'
            }
            bargainObj.bargainstatus = 'accepted'
            bargainObj.lastupdated = Date()
            bargainObj.quoteObj = quoteObj
           } else if (req.body.action == 'rejected') {
            quoteObj = {
              requestedon : bargain.secondquote.requestedon,
              buyerquote : bargain.secondquote.buyerquote,
              sellerquote : bargain.secondquote.sellerquote,
              status : 'rejected'
            }
            bargainObj.bargainstatus = 'rejected'
            bargainObj.lastupdated = Date()
            bargainObj.secondquote = quoteObj
           } else {
            quoteObj = {
              requestedon : Date(),
              buyerquote : req.body.buyerquote,
              status : 'countered'
            }
            bargainObj.bargainstatus = 'negotiation'
            bargainObj.lastupdated = Date()
            bargainObj.thirdquote = quoteObj
            }
            break;
      default :
          //Do Nothing
    }
  } else if (req.body.sellerquote) {
    switch (bargain.bargaincounter) {  
      case 1:
        if (req.body.sellerquote == bargain.firstquote.buyerquote) {
            quoteObj = {
              requestedon : bargain.firstquote.requestedon,
              buyerquote : bargain.firstquote.buyerquote,
              sellerquote : req.body.sellerquote,
              status : 'accepted'
            }
            bargainObj.bargainstatus = 'accepted'
            bargainObj.lastupdated = Date()
            bargainObj.firstquote = quoteObj 
           } else if (req.body.action == 'rejected') {
            quoteObj = {
              requestedon : bargain.firstquote.requestedon,
              buyerquote : bargain.firstquote.buyerquote,
              sellerquote : bargain.firstquote.sellerquote,
              status : 'rejected'
            }
            bargainObj.bargainstatus = 'rejected'
            bargainObj.lastupdated = Date()
            bargainObj.firstquote.status = quoteObj
           } else {
            quoteObj = {
              requestedon : bargain.firstquote.requestedon,
              buyerquote : bargain.firstquote.buyerquote,
              sellerquote : req.body.sellerquote,
              status : 'countered'
            }
            bargainObj.bargainstatus = 'negotiation'
            bargainObj.lastupdated = Date()
            bargainObj.firstquote = quoteObj
            bargainObj.bargaincounter = 2 
            }
            break;
      case 2:
          if (req.body.sellerquote == bargain.secondquote.buyerquote) {
            quoteObj = {
              requestedon : bargain.secondquote.requestedon,
              buyerquote : bargain.secondquote.buyerquote,
              sellerquote : req.body.sellerquote,
              status : 'accepted'
            }
            bargainObj.bargainstatus = 'accepted'
            bargainObj.lastupdated = Date()
            bargainObj.secondquote = quoteObj 
           } else if (req.body.action == 'rejected') {
            quoteObj = {
              requestedon : bargain.secondquote.requestedon,
              buyerquote : bargain.secondquote.buyerquote,
              sellerquote : req.body.secondquote,
              status : 'countered'
            } 
            bargainObj.bargainstatus = 'rejected'
            bargainObj.lastupdated = Date()
            bargainObj.secondquote.status = quoteObj
           } else {
            quoteObj = {
              requestedon : bargain.secondquote.requestedon,
              buyerquote : bargain.secondquote.buyerquote,
              sellerquote : req.body.sellerquote,
              status : 'countered'
            }
            bargainObj.bargainstatus = 'negotiation'
            bargainObj.lastupdated = Date()
            bargainObj.secondquote = quoteObj
            bargainObj.bargaincounter = 3 
            }
            break;
      case 3:
          if (req.body.sellerquote == bargain.thirdquote.buyerquote) {
            quoteObj = {
              requestedon : bargain.thirdquote.requestedon,
              buyerquote : bargain.thirdquote.buyerquote,
              sellerquote : req.body.sellerquote,
              status : 'accepted'
            }
            bargainObj.bargainstatus = 'accepted'
            bargainObj.lastupdated = Date()
            bargainObj.thirdquote = quoteObj 
           } else {
            quoteObj = {
              requestedon : bargain.thirdquote.requestedon,
              buyerquote : bargain.thirdquote.buyerquote,
              sellerquote : req.body.sellerquote,
              status : 'rejected'
            }
            bargainObj.bargainstatus = 'rejected'
            bargainObj.lastupdated = Date()
            bargainObj.firstquote = quoteObj
            }
            break;
      default :
          //Do Nothing
    }
  } else {
    // Do nothing
  }

  bargainupd = await Bargain.findByIdAndUpdate(req.params.id, bargainObj, {
    new: true
  });

  if (!bargainupd) return res.status(404).send('The item with the given ID was not found.');
  // Add logic to place confirm email and create order automatically in case of success or rejection.
  res.send(bargainupd);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const bargain = await Bargain.findByIdAndRemove(req.params.id);

  if (!bargain) return res.status(404).send('The genre with the given ID was not found.');

  res.send(bargain);
});

router.get('/:id', async (req, res) => {
  const bargain = await Bargain.findById(req.params.id);

  if (!bargain) return res.status(404).send('The genre with the given ID was not found.');

  res.send(bargain);
});

module.exports = router;