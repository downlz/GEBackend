const auth = require('../middleware/auth');
// const logger = require('../startup/logger');
const permit = require('../middleware/permissions');
const sendNotifications = require('../middleware/fcm');
const {sendAppNotifications} = require('./orders');
const {
  Bargain,
  validate
} = require('../models/bargain');
const {
  Item
} = require('../models/item');
const {
  User
} = require('../models/user');
const {
  placeOrder
} = require('./orders');
const {
  Order
} = require('../models/order');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const bargain = await Bargain.find().sort({'lastupdated':-1});
  res.send(bargain);
});


router.post('/', [auth], async (req, res) => {

  const itemdtl = await Item.findById(req.body.itemId);
  if (!itemdtl) return res.status(400).send('Invalid item.');

  const buyerid = await User.findById(req.body.buyerId);
  if (!buyerid) return res.status(400).send('Invalid Buyer');

  const sellerid = await User.findById(itemdtl.seller._id);
  if (!sellerid) return res.status(400).send('Invalid Seller');

  let bargainObj = _.pick(req.body, ['buyerquote', 'quantity']); // Creating a bargain object

  quoteObj = {
    requestedon: Date(),
    buyerquote: bargainObj.buyerquote,
    quantity: bargainObj.quantity,
    sellerquote: '',
    status: 'placed'
  }

  bargainObj.bargainstatus = 'placed';
  bargainObj.bargaincounter = 1;
  bargainObj.lastupdated = Date();
  bargainObj.firstquote = quoteObj;
  bargainObj.item = itemdtl;
  bargainObj.buyer = buyerid;
  bargainObj.seller = sellerid;

  const activebargain = await Bargain.find({
    $and: [{
      'item._id': itemdtl._id
    }, {
      'buyer._id': buyerid._id
    }, {
      bargainstatus: {
        $in: ['negotiation', 'placed', 'paused', 'lastbestprice']
      }
    }]
  }); // Add rule for datetime

  if (activebargain[0]){
    console.log('Active bargain in place cannot create a new one.')
  } else {
    let bargain = new Bargain(bargainObj);
    bargain = await bargain.save();

    sendAppNotifications(sellerid.fcmkey,
      'Bargain Request raised for ' + bargainObj.item.sampleNo,
      'A bargain trade has been placed by buyer.Click to negiotate the trade',
      bargain._id,
      'BargainDetail');
  //   var message = {
  //     notification: {
  //         title: 'Bargain Request raised for ' + bargainObj.item.sampleNo,
  //         body: 'A bargain trade has been placed by buyer.Click to negiotate the trade',
            
  //       },
  // //   data: {
  // //     score: '850',
  // //     time: '2:45'
  // //   },
  //       data : {
  //           id: JSON.stringify(bargain._id),
  //           type: 'BargainDetail'
  //       },
  //   token: sellerid.fcmkey
  // };
  // sendNotifications(message);
  }

  res.send(activebargain);

});

router.put('/:id', [auth, permit('admin', 'buyer', 'seller')], async (req, res) => {

  const bargain = await Bargain.findById(req.params.id);
  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');
  // console.log(bargain)
  var bargainObj = _.pick(req.body, [parseInt('buyerquote'), parseInt('sellerquote')]);
  // console.log(req.body);
  if (req.body.buyerquote) {
    switch (bargain.bargaincounter) {
      case 1:
        break;
        // Do nothing as buyer placecs a quote first which is handled in first request
      case 2:
        if (req.body.action == 'accepted') {
          quoteObj = {
            requestedon: bargain.firstquote.requestedon,
            buyerquote: bargain.firstquote.buyerquote,
            sellerquote: bargain.firstquote.sellerquote,
            status: 'accepted'
          }
          bargainObj.bargainstatus = 'accepted'
          bargainObj.lastupdated = Date()
          bargainObj.quoteObj = quoteObj
          strikeprice = bargain.firstquote.sellerquote
        } else if (req.body.action == 'rejected') {
          quoteObj = {
            requestedon: bargain.firstquote.requestedon,
            buyerquote: bargain.firstquote.buyerquote,
            sellerquote: bargain.firstquote.sellerquote,
            status: 'rejected'
          }
          bargainObj.bargainstatus = 'rejected'
          bargainObj.lastupdated = Date()
          bargainObj.firstquote = quoteObj
        } else {
          quoteObj = {
            requestedon: Date(),
            buyerquote: req.body.buyerquote,
            status: 'countered'
          }
          bargainObj.bargainstatus = 'negotiation'
          bargainObj.lastupdated = Date()
          bargainObj.secondquote = quoteObj
        }
        break;
      case 3:
        if (req.body.action == 'accepted') {
          quoteObj = {
            requestedon: bargain.secondquote.requestedon,
            buyerquote: bargain.secondquote.buyerquote,
            sellerquote: bargain.secondquote.sellerquote,
            status: 'accepted'
          }
          bargainObj.bargainstatus = 'accepted'
          bargainObj.lastupdated = Date()
          bargainObj.quoteObj = quoteObj
          strikeprice = bargain.secondquote.sellerquote
        } else if (req.body.action == 'rejected') {
          quoteObj = {
            requestedon: bargain.secondquote.requestedon,
            buyerquote: bargain.secondquote.buyerquote,
            sellerquote: bargain.secondquote.sellerquote,
            status: 'rejected'
          }
          bargainObj.bargainstatus = 'rejected'
          bargainObj.lastupdated = Date()
          bargainObj.secondquote = quoteObj
        } else {
          quoteObj = {
            requestedon: Date(),
            buyerquote: req.body.buyerquote,
            status: 'countered'
          }
          bargainObj.bargainstatus = 'negotiation'
          bargainObj.lastupdated = Date()
          bargainObj.thirdquote = quoteObj
        }
        break;
      default:
        //Do Nothing
    }
    // Send Notification to Seller
    sendAppNotifications(bargain.seller.fcmkey,
      'Bargain Request raised for ' + bargain.item.sampleNo,
      'Buyer responded to your bargain request',
      bargain._id,
      'BargainDetail');
  } else if (req.body.sellerquote) {
    switch (bargain.bargaincounter) {
      case 1:
        if (req.body.sellerquote == bargain.firstquote.buyerquote || req.body.action === 'accepted') {
          quoteObj = {
            requestedon: bargain.firstquote.requestedon,
            buyerquote: bargain.firstquote.buyerquote,
            sellerquote: bargain.firstquote.buyerquote,
            status: 'accepted'
          }
          bargainObj.bargainstatus = 'accepted'
          bargainObj.lastupdated = Date()
          bargainObj.firstquote = quoteObj
          strikeprice = bargain.firstquote.buyerquote
        } else if (req.body.action == 'rejected') {
          quoteObj = {
            requestedon: bargain.firstquote.requestedon,
            buyerquote: bargain.firstquote.buyerquote,
            sellerquote: bargain.firstquote.sellerquote,
            status: 'rejected'
          }
          bargainObj.bargainstatus = 'rejected'
          bargainObj.lastupdated = Date()
          bargainObj.firstquote = quoteObj
        } else {
          quoteObj = {
            requestedon: bargain.firstquote.requestedon,
            buyerquote: bargain.firstquote.buyerquote,
            sellerquote: req.body.sellerquote,
            status: 'countered'
          }
          bargainObj.bargainstatus = 'negotiation'
          bargainObj.lastupdated = Date()
          bargainObj.firstquote = quoteObj
          bargainObj.bargaincounter = 2
        }
        break;
      case 2:
        if (req.body.sellerquote == bargain.secondquote.buyerquote || req.body.action == 'accepted') {
          quoteObj = {
            requestedon: bargain.secondquote.requestedon,
            buyerquote: bargain.secondquote.buyerquote,
            sellerquote: bargain.secondquote.buyerquote,
            status: 'accepted'
          }
          bargainObj.bargainstatus = 'accepted',
          bargainObj.lastupdated = Date(),
          bargainObj.secondquote = quoteObj,
          strikeprice = bargain.secondquote.buyerquote
        } else if (req.body.action == 'rejected') {
          quoteObj = {
            requestedon: bargain.secondquote.requestedon,
            buyerquote: bargain.secondquote.buyerquote,
            sellerquote: req.body.secondquote,
            status: 'rejected'
          }
          bargainObj.bargainstatus = 'rejected'
          bargainObj.lastupdated = Date()
          bargainObj.secondquote = quoteObj
        } else {
          quoteObj = {
            requestedon: bargain.secondquote.requestedon,
            buyerquote: bargain.secondquote.buyerquote,
            sellerquote: req.body.sellerquote,
            status: 'countered'
          }
          bargainObj.bargainstatus = 'negotiation'
          bargainObj.lastupdated = Date()
          bargainObj.secondquote = quoteObj
          bargainObj.bargaincounter = 3
        }
        break;
      case 3:
        if (req.body.sellerquote == bargain.thirdquote.buyerquote || req.body.action == 'accepted') {
          quoteObj = {
            requestedon: bargain.thirdquote.requestedon,
            buyerquote: bargain.thirdquote.buyerquote,
            sellerquote: bargain.thirdquote.buyerquote,
            status: 'accepted'
          }
          bargainObj.bargainstatus = 'accepted'
          bargainObj.lastupdated = Date()
          bargainObj.thirdquote = quoteObj
          strikeprice = bargain.thirdquote.buyerquote
        } else if (req.body.action == 'rejected') {
          quoteObj = {
            requestedon: bargain.thirdquote.requestedon,
            buyerquote: bargain.thirdquote.buyerquote,
            sellerquote: req.body.thirdquote,
            status: 'rejected'
          }
          bargainObj.bargainstatus = 'rejected'
          bargainObj.lastupdated = Date()
          bargainObj.thirdquote = quoteObj
        } else {
          quoteObj = {
            requestedon: bargain.thirdquote.requestedon,
            buyerquote: bargain.thirdquote.buyerquote,
            sellerquote: req.body.sellerquote,
            status: 'countered'
          }
          bargainObj.bargainstatus = 'lastbestprice'
          bargainObj.lastupdated = Date()
          bargainObj.thirdquote = quoteObj
        }
        break;
      default:
        //Do Nothing
    }

    // Send Notification to Buyer
    sendAppNotifications(bargain.buyer.fcmkey,
      'Bargain Request raised for ' + bargain.item.sampleNo,
      'Seller responded to your bargain request',
      bargain._id,
      'BargainDetail');

    // strikeprice = req.body.sellerquote
  } else {
    // Do nothing
  }
  console.log(quoteObj);
  bargainupd = await Bargain.findByIdAndUpdate(req.params.id, bargainObj, {
    new: true
  });

  if (!bargainupd) return res.status(404).send('Issue with updating the document');
  // console.log(bargainupd);
  // Add logic to place confirm email and create order automatically in case of success or rejection.

  // **************************** Convert to order **************************** 
 if (req.body.action == 'accepted'){
  // const orderno = await Order.find().sort({
  //   orderno: -1
  // }).limit(1)

  // if (!orderno) return res.status(404).send('The item with the given ID was not found.');
  let order = {};
  // order.orderno = String(parseInt(orderno[0].orderno) + 1);
  order.itemId = bargain.item._id;

  order.unit = bargain.item.unit.mass;
  order.price = strikeprice; // Add quote price
  order.status = 'new';
  order.ordertype = 'bargainbuy';
  order.buyerId = bargain.buyer._id;
  order.sellerId = bargain.seller._id;
  order.quantity = bargain.quantity;
  // order.isshippingbillingdiff = 'false';
  order.placedTime = Date();
  order.cost = order.price * order.quantity;
  order.referenceBargainId = req.params.id;

  orderObj = await placeOrder(order, req, res);

  if (!orderObj) return res.status(404).send('There was an issue creating an order from bargain buy');
} else {
  res.send(bargainupd);
}
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const bargain = await Bargain.findByIdAndRemove(req.params.id);

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.get('/:id', async (req, res) => {
  const bargain = await Bargain.findById(req.params.id);
  // console.log(bargain);
  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.get('/buyer/:buyerid', async (req, res) => {

  const bargain = await Bargain.find({'buyer._id': req.params.buyerid}).sort({'lastupdated':-1});

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.get('/seller/:sellerid', async (req, res) => {

  const bargain = await Bargain.find({'seller._id': req.params.sellerid}).sort({'lastupdated':-1});

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.get('/buyer/:buyerid/item/:id', async (req, res) => {
  const bargain = await Bargain.find({$and :[{'buyer._id':req.params.buyerid},{'item._id':req.params.id},{'bargainstatus':{ $nin: [ 'accepted', 'rejected','expired' ] }}]});
  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');
  res.send(bargain);
});

router.get('/seller/:sellerid/item/:id', async (req, res) => {

  const bargain = await Bargain.find({$and :[{'seller._id':req.params.sellerid},{'item._id':req.params.id},{'bargainstatus':{ $nin: [ 'accepted', 'rejected','expired' ] }}]});

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.post('/squareoff', async (req, res) => {

  const bargain = await Bargain.updateMany({
    $and: [{
      'lastupdated': { $lte: Date.now() - 60*60*1000*24*2}
    },
    {
      bargainstatus: {
        $in: ['negotiation', 'placed', 'paused','lastbestprice']
      }
    }]
  },{'lastupdated': Date.now(),'bargainstatus': 'expired'});
  
  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.put('/pause/:id', async (req, res) => {
  const bargain = await Bargain.findByIdAndUpdate(req.params.id, { 
    'pausebargain.isPaused' : true,
    'pausebargain.pausetype': req.body.pausetype,
    'pausebargain.pausehrs' :  req.body.pausehrs,
    'pausebargain.pausestarttime' : Date.now(),
    'pausebargain.pauseendtime' : Date.now() + 60*60*1000 * req.body.pausehrs,
    'lastupdated' : Date.now(),
    'bargainstatus' : 'paused',
    'pausedby': req.body.pausedby
   }, {
    new: true
  });

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.get('/lapsetime/:id', [auth], async (req, res) => {

  const bargain = await Bargain.findById(req.params.id);
  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  // var epochdate = new Date(bargain.firstquote.requestedon)
  // lapsedate = epochdate.setHours(epochdate.getHours()+18); 
  // var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  // d.setUTCSeconds(lapsedate);
  // Math.floor(new Date(bargain.firstquote.requestedon) / 1000)
  

  res.send({
    "bargainlapse" : new Date(bargain.firstquote.requestedon.getTime() + 1000 * 3600 * 24 * 1)
  });
});

router.put('/release/:id', async (req, res) => {
  const bargain = await Bargain.findByIdAndUpdate(req.params.id, { 
    'pausebargain.isPaused' : false,
    // 'pausebargain.pausetype': req.body.pausetype,
    // 'pausebargain.pausehrs' :  req.body.pausehrs,
    // 'pausebargain.pausestarttime' : Date.now(),
    // 'pausebargain.pauseendtime' : Date.now() + 60*60*1000 * req.body.pausehrs,
    'lastupdated' : Date.now(),
    'bargainstatus' : 'negotiation'
   }, {
    new: true
  });

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

module.exports = router;


// db.bargains.find({$and :[{'buyer._id':ObjectId("5cff1e5c8815d1d1d9384bea")},{'item._id':ObjectId("5d0064db2bc290ddd71488d6")},{'bargainstatus':{ $nin: [ 'accepted', 'rejected','expired' ] }}]});