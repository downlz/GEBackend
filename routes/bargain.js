const auth = require('../middleware/auth');
// const logger = require('../startup/logger');
const permit = require('../middleware/permissions');
const sendNotifications = require('../middleware/fcm');
const {sendAppNotifications} = require('./orders');
const sendEmail = require('../middleware/sendemail');
const moment = require('moment');
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
      if (req.query.pageid) {
        recordtoskip = (req.query.pageid - 1) * 15;
        rowslimit = 15;  
    } else {
        recordtoskip = 0;
        rowslimit = 0;
    }
  const bargain = await Bargain.find().sort({'lastupdated':-1}).skip(recordtoskip).limit(rowslimit);
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

  //   sendAppNotifications(sellerid.fcmkey,
  //     'Bargain Request raised for ' + bargainObj.item.sampleNo,
  //     'A bargain trade has been placed by buyer.Click to negiotate the trade',
  //     bargain._id,
  //     'BargainDetail');
  // }

  var message = {
    notification: {
        title: JSON.stringify('Bargain Request raised for ' + bargainObj.item.sampleNo),
        body: 'A bargain request has been placed by buyer.Click to negotiate the trade',
        // image: "https://ibin.co/2t1lLdpfS06F.png",
      },
      data : {
          id: JSON.stringify(bargain._id),
          type: 'BargainDetail',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: JSON.stringify('Bargain Request raised for ' + bargainObj.item.sampleNo),
          body: 'A bargain request has been placed by buyer.Click view to negotiate the trade',
          //  "status": "done",
          image: "https://ibin.co/2t1lLdpfS06F.png",
      },
  token: sellerid.fcmkey
  };
  if (sellerid.fcmkey) {
    sendNotifications(message);
  }

  // Also send email

  var message = `<p>Dear User,</p>
        <p>Thank you for using GrainEasy.<br>
        A bargain request is placed by buyer. To negotiate the trade please use the mobile application or website to place your quote
        The bargain request is valid till 8:00 PM today. You can counter quote a offer made by buyer a maximum of 3 times or 
        accept the quote by buyer to book an order or reject the buyer quote.<br>
        To connect with graineasy team you can text us at <a href="https://api.whatsapp.com/send?phone=919007555357">Whatsapp</a><br>

        <a href="https://graineasy.com/bargainRequest">See All Bargain Request</a><br>
        Please feel free to reach out to us on trade@graineasy.com for any clarification about bargain process

        <br><br>
        Regards,<br>
        Graineasy
        </p>`
    var emailsubject = 'Bargain Request raised for ' + bargainObj.item.sampleNo
    
    sendEmail(sellerid.email, process.env.EMAILCCUSER, process.env.EMAILBCCUSER,emailsubject, message);
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
    // sendAppNotifications(bargain.seller.fcmkey,
    //   'Bargain Request raised for ' + bargain.item.sampleNo,
    //   'Buyer responded to your bargain request',
    //   bargain._id,
    //   'BargainDetail');

    var message = {
      notification: {
          title: JSON.stringify('Bargain Request raised for ' + bargain.item.sampleNo),
          body: 'Buyer responded to your bargain request',
          // image: "https://ibin.co/2t1lLdpfS06F.png",
        },
        data : {
            id: JSON.stringify(bargain._id),
            type: 'BargainDetail',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            title: JSON.stringify('Bargain Request raised for ' + bargain.item.sampleNo),
            body: 'Buyer responded to your bargain request.Click view to check quote',
            //  "status": "done",
            image: "https://ibin.co/2t1lLdpfS06F.png",
        },
    token: bargain.seller.fcmkey
    };
  
    if (bargain.seller.fcmkey) {
      sendNotifications(message);
      }

      var message = `<p>Dear User,</p>
      <p><br>
      Buyer responded to your bargain request. To negotiate the trade please use the mobile application or website to place your quote
      The bargain request is valid till 8:00 PM today. You can counter quote a offer made by buyer a maximum of 3 times or 
      accept the quote by buyer to book an order or reject the buyer quote.<br>
      To connect with graineasy team you can text us at <a href="https://api.whatsapp.com/send?phone=919007555357">Whatsapp</a><br>

      <a href="https://graineasy.com/bargainRequest">See All Bargain Request</a><br>
      Please feel free to reach out to us on trade@graineasy.com for any clarification about bargain process

      <br><br>
      Regards,<br>
      Graineasy
      </p>`
  var emailsubject = 'Bargain Request raised for ' + bargain.item.sampleNo
  
  sendEmail(bargain.seller.email, process.env.EMAILCCUSER, process.env.EMAILBCCUSER,emailsubject, message);   

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
    // sendAppNotifications(bargain.buyer.fcmkey,
    //   'Bargain Request raised for ' + bargain.item.sampleNo,
    //   'Seller responded to your bargain request',
    //   bargain._id,
    //   'BargainDetail');

    var message = {
      notification: {
          title: JSON.stringify('Bargain Request raised for ' + bargain.item.sampleNo),
          body: 'Seller responded to your bargain request',
          // image: "https://ibin.co/2t1lLdpfS06F.png",
        },
        data : {
            id: JSON.stringify(bargain._id),
            type: 'BargainDetail',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            title: JSON.stringify('Bargain Request raised for ' + bargain.item.sampleNo),
            body: 'Seller responded to your bargain request.Click view to check quote',
            //  "status": "done",
            image: "https://ibin.co/2t1lLdpfS06F.png",
        },
    token: bargain.buyer.fcmkey
    };
  
    if (bargain.buyer.fcmkey) {
      sendNotifications(message);
    }

    var message = `<p>Dear User,</p>
      <p><br>
      Seller responded to your bargain request. To negotiate the trade please use the mobile application or website to place your quote
      The bargain request is valid till 8:00 PM today. You can counter quote a offer made by seller a maximum of 3 times or 
      accept the quote by seller to book an order or reject the seller quote.<br>
      To connect with graineasy team you can text us at <a href="https://api.whatsapp.com/send?phone=919007555357">Whatsapp</a><br>
      
      <a href="https://graineasy.com/bargainRequest">See All Bargain Request</a><br>
      Please feel free to reach out to us on trade@graineasy.com for any clarification about bargain process

      <br><br>
      Regards,<br>
      Graineasy
      </p>`
    var emailsubject = 'Bargain Request raised for ' + bargain.item.sampleNo
    
    sendEmail(bargain.buyer.email, process.env.EMAILCCUSER, process.env.EMAILBCCUSER,emailsubject, message);  

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

      if (req.query.pageid) {
        recordtoskip = (req.query.pageid - 1) * 15;
        rowslimit = 15;  
    } else {
        recordtoskip = 0;
        rowslimit = 0;
    }

  const bargain = await Bargain.find({'buyer._id': req.params.buyerid}).sort({'lastupdated':-1}).skip(recordtoskip).limit(rowslimit);

  if (!bargain) return res.status(404).send('The bargain details with the given ID was not found.');

  res.send(bargain);
});

router.get('/seller/:sellerid', async (req, res) => {

      if (req.query.pageid) {
        recordtoskip = (req.query.pageid - 1) * 15;
        rowslimit = 15;  
    } else {
        recordtoskip = 0;
        rowslimit = 0;
    }

  const bargain = await Bargain.find({'seller._id': req.params.sellerid}).sort({'lastupdated':-1}).skip(recordtoskip).limit(rowslimit);

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
      'lastupdated': { $lte: Date.now() - 60*60*1000*24*1}
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

// router.get('/test', async (req, res) => {
//   const bargain = await Bargain.find({
//     $and: [{
//       'lastupdated': { $lte: Date.now() - 60*60*1000*24*1}
//     },
//     {
//       bargainstatus: {
//         $in: ['negotiation', 'placed', 'paused','lastbestprice']
//       }
//     }]},{'bargaincounter':1}).sort({'lastupdated':-1});
  
//   if (!bargain) return res.status(404).send('Couldnot find bargains to square off.');

//   res.send(bargain);
// });

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

  newdate = new Date(moment(bargain.firstquote.requestedon).format('YYYY-MM-DD'))
  finaldate = new Date(moment(newdate).add(20, 'hours'));
  
  res.send({
    // "bargainlapse" : new Date(bargain.firstquote.requestedon.getTime() + 1000 * 3600 * 24 * 1)
    "bargainlapse" : finaldate
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