const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const sendEmail = require('../middleware/sendemail');
const {Order, validate} = require('../models/order');
const {Item} = require('../models/item');
const {Unit} = require('../models/unit');
const {GroupbuyingList} = require('../models/gblist');
const {Auction} = require('../models/auction');
const {User} = require('../models/user');
const {State} = require('../models/state');
const {Address, validateAddress} = require('../models/address');
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

router.get('/', async (req, res) => {
    const order = await Order.find().sort({'placedTime':-1});
    res.send(order);
});

// Check below permit as in future seller may also place order
router.post('/', [auth, permit('buyer', 'admin')], async (req, res) => {
    await placeOrder(req.body, req, res)
});

async function placeOrder(obj, req, res) {
    // console.log(obj);
    // const {error} = validate(obj);
    // console.log(error)
    // if (error) return res.status(400).send(error.details[0].message);
    // console.log(error)

    const item = await Item.findById(obj.itemId);
    if (!item) return res.status(400).send('Invalid Item.');

    // const address = await Address.findById(obj.addressId);
    // if (!address) return res.status(400).send('Invalid address.');

    let buyer, seller;
    // if (obj.buyerId) {
        buyer = await User.findById(obj.buyerId);
        if (!buyer) return res.status(400).send('Invalid buyer.');
        // console.log(buyer);
    // } else {
        seller = await User.findById(obj.sellerId);
        if (!seller) return res.status(400).send('Invalid seller.');
    // }

    let orderObj = _.pick(obj, ['orderno', 'quantity', 'unit','address',
        'cost', 'placedTime', 'paymentMode', 'status', 'ordertype', 'price','isshippingbillingdiff']);
    
    await dropIfDNE(orderObj,['orderno', 'quantity', 'unit','address',
    'cost', 'placedTime', 'paymentMode', 'status', 'ordertype', 'price','isshippingbillingdiff']);

    if (req.body.isshippingbillingdiff == true) {
        state = await State.findById(obj.state);
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
        phone: '+91' + req.body.phone,
        addedby: obj.buyerId,
        addresstype: 'delivery',
        }; 
        address = new Address(addressObj);
        savedaddr = await address.save();    
        orderObj.shippingaddress = savedaddr;
    } else if (req.body.isshippingbillingdiff == false){
        // console.log(typeof(obj.addressreference));
        // orderObj.shippingaddress = obj.addressreference //don't update anything app will pickup default registered address
    } else {
        // Think at some point of time.Critical for other order types
    }
       
    orderObj.item = item;
    //orderObj.address = address;
    orderObj.buyer = buyer;
    // console.log(orderObj.buyer);
    orderObj.seller = seller;
    // orderObj.shippingaddress = address;

    if (obj.referenceGBId) {
        const gblist = await GroupbuyingList.findById(obj.referenceGBId);
        if (!gblist) return res.status(400).send('Invalid Reference Group buying id');
        orderObj.referenceGB = gblist;
    }

    if (obj.referenceAuctionId) {
        const auction = await Auction.findById(obj.referenceAuctionId);
        if (!auction) return res.status(400).send('Invalid Reference Auction id');
        orderObj.referenceAuction = auction;
    }
    orderObj.lastUpdated = Date();

    let order = new Order(orderObj);
    // console.log(order)
    order = await order.save();
    let message = `<p>Dear User,</p>
        <p>Thank you for using GrainEasy.<br>
        Your order has been placed successfully.The order is being reviewed and you would
        receive an email upon order confirmation<br>
        Please feel free to reach out to us on trade@graineasy.com for any clarification.
        <br><br>
        Regards,<br>
        Graineasy
        </p>`

    sendEmail(order.buyer.email, process.env.EMAILCCUSER, 'Order Placed - ' + order.orderno, message);
    res.send(order);
    return order;
}

router.put('/:id', [auth, permit('buyer', 'admin')], async (req, res) => {

    if (req.body.addressId) {
        const address = await Address.findById(req.body.addressId);
        if (!address) return res.status(400).send('Invalid category.');
    }

    let orderObj = _.pick(req.body, ['quantity',
        'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
        'receivedTime','readyTime','lastUpdated', 'paymentMode', 'status','remarks']);
    
    await dropIfDNE(orderObj,['quantity',
    'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
    'receivedTime','readyTime','lastUpdated', 'paymentMode', 'status','remarks']); 

    if (req.body.addressId) {
        orderObj.address = address;
    }

    if (req.body.status == 'ready') {
        const orderinv = await Order.find().sort({'invoiceno': -1}).limit(1)
        invoiceno =  parseInt(orderinv[0].invoiceno) + 1;
        orderObj.invoiceno = String(invoiceno);
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
    var messagesign = `<p>Order Status - <b>` + order.status + `</b></p>
                        <p>Please feel free to reach out to us on trade@graineasy.com for any clarification.   
                        <br><br>Regards,<br>
                        Graineasy
                        </p>`

    switch(req.body.status) {
        case 'confirmed':
            orderObj.confirmedTime = Date(); 
            messageorderstatus = `<p>Your order-`+ order.orderno + ` has been accepted by the seller and confirmed by the admin.</p>`
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
    
    sendEmail(order.buyer.email, process.env.EMAILCCUSER, 'Order Intimation from Graineasy - ' + order.orderno, message);
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

router.get('/orderno', [auth], async (req, res) => {
    const order = await Order.find().sort({orderno: -1}).limit(1)
    if (!order) return res.status(404).send('The item with the given ID was not found.');
    res.send(order);
    // res.send(order[0].orderno);
});

router.get('/user/:id', [auth], async (req, res) => {
    // const order = await Order.findById(req.params.id);

    const customer = await User.findById(req.params.id);
    // console.log(req.params.id);
    // console.log(customer);
    if (!customer) return res.status(400).send('Invalid buyer.');
    let order = null;
    if (customer.isSeller) {
        order = await Order.find({seller: customer}).sort({'placedTime': -1});
    } else {
        order = await Order.find({buyer: customer}).sort({'placedTime': -1});
    }

    if (!order) return res.status(404).send('The item with the given ID was not found.');

    res.send(order);
});

module.exports = {
    router,
    placeOrder,
    dropIfDNE
};
