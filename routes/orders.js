const auth = require('../middleware/auth');
// const logger = require('../startup/logger');
const permit = require('../middleware/permissions');
const sendEmail = require('../middleware/sendemail');
const sendNotifications = require('../middleware/fcm');
const {Order, validate} = require('../models/order');
const {Taxrate} = require('../models/taxrates');
const {Item} = require('../models/item');
const {Unit} = require('../models/unit');
const {GroupbuyingList} = require('../models/gblist');
const {Bargain} = require('../models/bargain');
const {Auction} = require('../models/auction');
const {User} = require('../models/user');
const {State} = require('../models/state');
const {City} = require('../models/city');
const {Address, validateAddress} = require('../models/address');
const {AgentBuyer} = require('../models/agentbuyer');
const {Paymentdtl}  = require('../models/paymentdtl');
const mongoose = require('mongoose');
// const {ObjectId} = require('mongodb');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

function dropIfDNE(Obj, arr) {
    for (var i = 0, size = arr.length; i < size ; i++) {
      if (!Obj[arr[i]]) delete Obj[arr[i]];
    }
  }

router.get('/', [auth], async (req, res) => {
    // const order = await Order.find().sort({'placedTime':-1});            // Old order query pulling all records
    if (req.query.pageid) {
        recordtoskip = (req.query.pageid - 1) * 15;
        rowslimit = 15;  
    } else {
        recordtoskip = 0;
        rowslimit = 0;
    }
    const order = await Order.find().sort({'placedTime': -1}).skip(recordtoskip).limit(rowslimit);
    res.send(order);
});

// Check below permit as in future seller may also place order
router.post('/', async (req, res) => {          //[auth, permit('buyer', 'admin' ,'agent')]
    await placeOrder(req.body, req, res)
});

async function placeOrder(obj, req, res) {

    const item = await Item.findById(obj.itemId);
    if (!item) return res.status(400).send('Invalid Item.');

    // const address = await Address.findById(obj.addressId);
    // if (!address) return res.status(400).send('Invalid address.');

    const ordno = await Order.find().sort({orderno: -1}).limit(1)
    if (!ordno) return res.status(404).send('The item with the given ID was not found.');

    let buyer, seller;
    // if (obj.buyerId) {
        buyer = await User.findById(obj.buyerId);
        if (!buyer) return res.status(400).send('Invalid buyer.');
        // logger.info(buyer);
    // } else {
        seller = await User.findById(obj.sellerId);
        if (!seller) return res.status(400).send('Invalid seller.');
    // }

    let orderObj = _.pick(obj, [ 'quantity', 'unit','address',
        'cost', 'placedTime', 'paymentMode', 'status', 'ordertype', 'paymentterms','price','isshippingbillingdiff','isExistingAddr','remarks']);
    
    await dropIfDNE(orderObj,['quantity', 'unit','address',
    'cost', 'placedTime', 'paymentMode', 'status', 'ordertype', 'paymentterms','price','isshippingbillingdiff','isExistingAddr','remarks']);

    orderObj.orderno = parseInt(ordno[0].orderno) + 1
    // console.log(orderObj.orderno)
    if (req.body.isshippingbillingdiff == true) {

        city = await City.findById(obj.city);
        if (!city) return res.status(400).send('Invalid City');

        state = await State.findById(city.state._id);
        if (!state) return res.status(400).send('Invalid State');


    partyObj = {
        partyname: req.body.partyname,
        gstin: req.body.gstin 
    }
    
    addressObj = {
        text: req.body.address,
        pin: req.body.pincode,
        addressbasicdtl: partyObj,
        state: state,
        city: city,
        phone: '+91' + req.body.phone,
        addedby: obj.addedby,
        addresstype: obj.addresstype,
        }; 

        // Added to collect city
        // if (obj.city){
        //     city = await City.findById(obj.city);
        //     if (!city) return res.status(400).send('Invalid City');

        //     addressObj.city = city;
        // }
        if (req.body.isExistingAddr == false) {
            if (req.body.ordertype == 'agentorder') {
                delete addressObj.addresstype
                agentbuyer = new AgentBuyer(addressObj);
                savedaddr = await agentbuyer.save();    
                orderObj.shippingaddress = savedaddr;
            } else {
                address = new Address(addressObj);
                savedaddr = await address.save();    
                orderObj.shippingaddress = savedaddr;
            }
        } 
        else {
            if (req.body.ordertype == 'agentorder') {
                const deliveryaddress = await AgentBuyer.findById(obj.addressreference);
                orderObj.shippingaddress = deliveryaddress;
            } else {
                const deliveryaddress = await Address.findById(obj.addressreference);
                orderObj.shippingaddress = deliveryaddress;
            }
        }
    } else if (req.body.isshippingbillingdiff == false){
        // logger.info(typeof(obj.addressreference));
        // orderObj.shippingaddress = obj.addressreference //don't update anything app will pickup default registered address
    } else {
        // Think at some point of time.Critical for other order types
    }
       
    orderObj.item = item;
    //orderObj.address = address;
    orderObj.buyer = buyer;
    // logger.info(orderObj.buyer);
    orderObj.seller = seller;
    // orderObj.shippingaddress = address;

    if (obj.referenceGBId) {
        const gblist = await GroupbuyingList.findById(obj.referenceGBId);
        if (!gblist) return res.status(400).send('Invalid Reference Group buying id');
        orderObj.referenceGB = gblist;
    }

    if (obj.referenceBargainId) {
        const bargain = await Bargain.findById(obj.referenceBargainId);
        if (!bargain) return res.status(400).send('Invalid Reference Bargain id');
        orderObj.referenceBargain = bargain;
    }

    if (obj.referenceAuctionId) {
        const auction = await Auction.findById(obj.referenceAuctionId);
        if (!auction) return res.status(400).send('Invalid Reference Auction id');
        orderObj.referenceAuction = auction;
    }
    orderObj.lastUpdated = Date();

    let order = new Order(orderObj);
    order = await order.save();

    /* Adding payment detail for the time being with minimal inputs */
    
    paymentmodeObj = {
        orderid: order._id,
        orderno: orderObj.orderno,
        mode: req.body.payeeacc,
        requestedon: Date() 
    }

    let payeedtl = new Paymentdtl(paymentmodeObj);
    payeedtl = await payeedtl.save();

    var message = `<p>Dear User,</p>
        <p>Thank you for using GrainEasy.<br>
        Your order has been placed successfully.The order is being reviewed and you would
        receive an email upon order confirmation<br>
        Please feel free to reach out to us on trade@graineasy.com for any clarification.
        <br><br>
        Regards,<br>
        Graineasy
        </p>`
    var emailsubject;
    if (order.ordertype == 'sampleorder'){
        emailsubject = 'Sample order placed - ' + order.orderno
    } else {
        emailsubject = 'Order Placed - ' + order.orderno
    }

    sendEmail(order.buyer.email, process.env.EMAILCCUSER, process.env.EMAILBCCUSER,emailsubject, message);
    // sendAppNotifications(order.buyer.fcmkey,
    //     'Order Placed',
    //     'Thank you for booking your order.The order is placed successfully and you will be notified soon.',
    //     order._id,
    //     'OrderDetail');

    var appmessage = {
        notification: {
            title: 'Order Placed',
            body: 'Thank you for booking your order.The order is placed successfully and you will be notified soon.',
            // image: "https://ibin.co/2t1lLdpfS06F.png",
          },
          data : {
              id: JSON.stringify(order._id),
              type: 'OrderDetail',
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
              title: 'Order Placed',
              body: 'Thank you for booking your order.The order is placed successfully and you will be notified soon.',
              //  "status": "done",
              image: "https://ibin.co/2t1lLdpfS06F.png",
          },
      token: order.buyer.fcmkey
      };
      
    //   if (order.buyer.fcmkey) {
    //     sendNotifications(appmessage);
    //   }

    res.send(order);
    return order;
}

router.put('/:id', [auth, permit('buyer', 'admin','seller','agent')], async (req, res) => {
    // console.log(req.body);
    if (req.body.addressId) {
        const address = await Address.findById(req.body.addressId);
        if (!address) return res.status(400).send('Invalid category.');
    }
    
    const orderdtl = await Order.findById(req.params.id);

    let orderObj = _.pick(req.body, ['quantity',
        'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
        'receivedTime','readyTime','lastUpdated', 'paymentMode', 'paymentterms','status','remarks']);
    
    await dropIfDNE(orderObj,['quantity',
    'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
    'receivedTime','readyTime','lastUpdated', 'paymentMode','paymentterms', 'status','remarks']); 

    if (req.body.addressId) {
        orderObj.address = address;
    }

    
    if ((orderdtl.invoiceno === undefined || orderdtl.invoiceno == null) && (req.body.status == 'ready' || req.body.status == 'shipped' || req.body.status == 'delivered')) {
        
        const orderinv = await Order.find().sort({'invoiceno': -1}).limit(1)
        invoiceno =  parseInt(orderinv[0].invoiceno) + 1;
        orderObj.invoiceno = String(invoiceno);
        
    } else if (req.body.status == 'cancelled'){
        orderObj.invoiceno = null;
    } else {
        // Do Nothing
    }

    orderObj.lastUpdated = Date();          // Update lastupdated datetimestart

    const order = await Order.findByIdAndUpdate(req.params.id, orderObj, {
        new: true
    });
    
    if (!order) return res.status(404).send('The item with the given ID was not found.');
    
    var message;
    var messagegreetings = `<p>Dear User,</p>
                            <p>Thank you for using GrainEasy.</p>`
    var messageorderstatus;
    var messagesign = `<p>Order Status - <b>` + req.body.status + `</b></p>
                        <p>Please feel free to reach out to us on trade@graineasy.com for any clarification.   
                        <br><br>Regards,<br>
                        Graineasy
                        </p>`

    switch(req.body.status) {
        case 'new':
            // orderObj.confirmedTime = Date(); 
            messageorderstatus = `<p>Your order-`+ order.orderno + ` has been placed successfully and is being reviewed.</p>`
            break;
        case 'confirmed':
            orderObj.confirmedTime = Date(); 
            messageorderstatus = `<p>Your order-`+ order.orderno + ` has been accepted by the seller and confirmed by admin.</p>`
            break;
        case 'ready':
            orderObj.readyTime = Date();   
            messageorderstatus = `<p>Your order-`+ order.orderno + ` is ready for dispatch</p>`
            break;
        case  'shipped':
            orderObj.shipmentTime = Date();
            messageorderstatus = `<p>Your order-`+ order.orderno + ` has been shipped</p>`
            break;
        case 'delivered':
            orderObj.receivedTime = Date();  
            messageorderstatus = `<p>Your order-`+ order.orderno + ` has been delivered.</p>` 
            break;
        case 'cancelled':
            messageorderstatus = `<p>Your order-`+ order.orderno + ` has been cancelled.</b> Order cancellation notes - ` + orderObj.remarks + `</p>`
            console.log('Order Cancelled ' + order.orderno + ' ' + Date());
            break;
        default:
            // Do nothing
    }
    
    
    message = messagegreetings + messageorderstatus + messagesign
    var emailsubject;
    if (order.ordertype == 'sampleorder'){
        emailsubject = 'Sample order update - ' + order.orderno
    } else {
        emailsubject = 'Order Intimation from Graineasy - ' + order.orderno
    }
    
    sendEmail(order.buyer.email, process.env.EMAILCCUSER,process.env.EMAILBCCUSER, emailsubject, message);
    // sendAppNotifications(order.buyer.fcmkey,
    //     emailsubject,
    //     messageorderstatus.slice(3,-4),
    //     order._id,
    //     'OrderDetail');

        var appmessage = {
            notification: {
                title: JSON.stringify(emailsubject),
                body: JSON.stringify(messageorderstatus.slice(3,-4)),
                // image: "https://ibin.co/2t1lLdpfS06F.png",
              },
              data : {
                  id: JSON.stringify(order._id),
                  type: 'OrderDetail',
                  click_action: 'FLUTTER_NOTIFICATION_CLICK',
                  title: JSON.stringify(emailsubject),
                  body: JSON.stringify(messageorderstatus.slice(3,-4)),
                  //  "status": "done",
                  image: "https://ibin.co/2t1lLdpfS06F.png",
              },
          token: order.buyer.fcmkey
          };
          
          if (order.buyer.fcmkey) {
            sendNotifications(appmessage);
          }
          

    res.send(order);

});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) return res.status(404).send('The item with the given ID was not found.');

    res.send(order);
});

router.get('/id/:id', [auth], async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).send('The item with the given ID was not found.');

    res.send(order);
});

router.get('/orderno', [auth,permit('admin','agent','seller','buyer')], async (req, res) => {
    const order = await Order.find().sort({orderno: -1}).limit(1)
    if (!order) return res.status(404).send('The item with the given ID was not found.');
    res.send(order);
});

router.get('/user/:id', [auth], async (req, res) => {
    const customer = await User.findById(req.params.id);
    
    if (!customer) return res.status(400).send('Invalid buyer or seller');
    let order = null;
    // order = await Order.find({buyer: customer}).sort({'placedTime': -1});

    // Due to role policy first check if buyer id is same as seller/agent if yes fetch the details else pull seller details
    if (req.query.pageid) {
        recordtoskip = (req.query.pageid - 1) * 15;
        rowslimit = 15;  
    } else {
        recordtoskip = 0;
        rowslimit = 0;
    }
    if (customer.isSeller) {
        order = await Order.find({'seller._id': customer._id}).sort({'placedTime': -1}).skip(recordtoskip).limit(rowslimit);
    } else {
        order = await Order.find({'buyer._id': customer._id}).sort({'placedTime': -1}).skip(recordtoskip).limit(rowslimit);;
    }    
    if (!order) return res.status(404).send('The item with the given ID was not found.');
    
    res.send(order);
});


router.get('/agent/:id', [auth], async (req, res) => {

    const customer = await User.findById(req.params.id);
   
    if (!customer) return res.status(400).send('Invalid buyer or seller');
    let order = null;

    if (req.query.pageid) {
        recordtoskip = (req.query.pageid - 1) * 15;
        rowslimit = 15;  
    } else {
        recordtoskip = 0;
        rowslimit = 0;
    }
    // Due to role policy first check if buyer id is same as seller/agent if yes fetch the details else pull seller details
    
    order = await Order.find({buyer: customer}).sort({'placedTime': -1}).skip(recordtoskip).limit(rowslimit);;

    if (!order) return res.status(404).send('The item with the given ID was not found.');
    
    res.send(order);
});

async function getTaxBreakup(userObj) {

  const cgstresponse = await Taxrate.find({type:'cgst'});        // append date based on order
  var sgstresponse = [{'ratepct':0}];
//   sgstresponse[0].ratepct = 0;
  var igstresponse = [{
      'ratepct': 0
  }];
//   sgstresponse[0].ratepct = 0;

    // Calculating tax, apply logic to calculate igst and sgst
  cgst = (cgstresponse[0].ratepct/100) * parseInt(userObj.cost);
  if (userObj.seller.Addresses[0].state.name === userObj.buyer.Addresses[0].state.name) {
      var sgstresponse = await Taxrate.find({
          type: 'sgst'
      });
    sgst = (sgstresponse[0].ratepct/100) * parseInt(userObj.cost);
    igst = 0
  } else {
      var igstresponse = await Taxrate.find({
          type: 'igst'
      });
    igst = (igstresponse[0].ratepct/100) * parseInt(userObj.cost);
    sgst = 0
  }
  total = parseInt(userObj.cost) + cgst + igst + sgst;

  taxDetail = {
    'taxwithcost' : total,
    'cgst' : cgst,
    'igst' : igst,
    'sgst' : sgst,
    'taxrates' : [cgstresponse[0].ratepct,sgstresponse[0].ratepct,igstresponse[0].ratepct]
  }
    return taxDetail;
};

async function sendAppNotifications(usertoken,msgtitle,msgbody,pageid,page) {

    // var registrationToken = 'e2D8wUCeHTE:APA91bHrtgPjTTYFkGAkCI7-9ZL8P6-32D--F8a40Fe0nbb-o9tw_wJlS5BGwrZnCNylxCeknSUn_sQc87HegwxeKUks28JYCpzjvsdS4xcwgPTiH0ojB1E5pF-kMeJjELS_sdoMJFgW';

var message = {
    notification: {
        title: JSON.stringify(msgtitle),
        body: JSON.stringify(msgbody)
      },
//   data: {
//     score: '850',
//     time: '2:45'
//   },
      data : {
          id: JSON.stringify(pageid),
          type: JSON.stringify(page),
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          title: JSON.stringify(msgtitle),
           body: JSON.stringify(msgbody),
          image: "https://ibin.co/2t1lLdpfS06F.png",
      },
  token: usertoken
};

// var message = {
//     notification: {
//         title: 'Text Message',
//         body: 'I am testing FCM Notifications',
//         image: "https://ibin.co/2t1lLdpfS06F.png",
//       },
//       data : {
//           id: '1',
//           type: 'BargainDetail',
//           click_action: 'FLUTTER_NOTIFICATION_CLICK',
//           title: JSON.stringify(req.body.title),
//           body: JSON.stringify(req.body.body),
//           //  "status": "done",
//           image: "https://ibin.co/2t1lLdpfS06F.png",
//       },
//   token: userid.fcmkey
//   };


sendNotifications(message);
    return message;
}

module.exports = {
    router,
    placeOrder,
    dropIfDNE,
    getTaxBreakup,
    sendAppNotifications
};
