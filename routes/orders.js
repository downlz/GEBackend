const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Order, validate} = require('../models/order');
const {Item} = require('../models/item');
const {Unit} = require('../models/unit');
const {GroupbuyingList} = require('../models/gblist');
const {Auction} = require('../models/auction');
const {User} = require('../models/user');
const {State} = require('../models/state');
const {Address, validateAddress} = require('../models/address');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

function dropIfDNE(Obj, arr) {
    for (var i = 0, size = arr.length; i < size ; i++) {
      if (!Obj[arr[i]]) delete Obj[arr[i]];
    }
  }

router.get('/', async (req, res) => {
    const order = await Order.find().sort('placedTime');
    res.send(order);
});

router.post('/', [auth, permit('buyer', 'admin')], async (req, res) => {
    // console.log("Hello")
    await placeOrder(req.body, req, res)
});

async function placeOrder(obj, req, res) {
    console.log(obj);
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
        console.log(buyer);
    // } else {
        seller = await User.findById(obj.sellerId);
        if (!seller) return res.status(400).send('Invalid seller.');
    // }

    let orderObj = _.pick(obj, ['orderno', 'quantity', 'unit',
        'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
        'receivedTime', 'paymentMode', 'status', 'ordertype', 'price','isshippingbillingdiff']);
    
    dropIfDNE(orderObj,['orderno', 'quantity', 'unit',
    'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
    'receivedTime', 'paymentMode', 'status', 'ordertype', 'price','isshippingbillingdiff'])

    if (req.body.isshippingbillingdiff == true) {
        state = await State.findById(obj.state);
        if (!state) return res.status(400).send('Invalid State');

    partyObj = {
        partyname: req.body.partyname,
        gstin: req.body.gstin 
    }
    // console.log(partyObj)
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

    let order = new Order(orderObj);
    // console.log(order)
    order = await order.save();
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
        'receivedTime', 'paymentMode', 'status']);

    if (req.body.addressId) {
        orderObj.address = address;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, orderObj, {
        new: true
    });

    if (!order) return res.status(404).send('The item with the given ID was not found.');

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
    placeOrder
};
