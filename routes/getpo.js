const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Order} = require('../models/order');
const {Item} = require('../models/item');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const PDFDocument = require('pdfkit');

router.get('/id/:id', async (req, res) => {
  id  = req.params.id;
  const doc = new PDFDocument();
  var lorem = 'kfdshjkxbkbhdkjhbcn  gkdhfgkjhdfgkh'
  const result = await Order.findById(id);
      
      title        = result.orderno,
      quantity      = result.quantity;
      cost = result.cost;
      placedTime  = result.placedTime;
      confirmedTime         = result.status;
      ordertype         = result.ordertype;
      filename     = encodeURIComponent(title) + '.pdf';
      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');
      doc.fontSize(10).text('Order Placed On ' + placedTime, 100, 80);
      doc
        .moveDown()
        .fontSize(15).text('Order No - ' + title, 100, 50);
      doc.circle(280, 200, 50).fill('#6600FF');
      doc
        .text('Order Value ' + cost, 100, 300)
        .font('Times-Roman', 13)
        .moveDown()
        .text(lorem, {
          width: 412,
          align: 'justify',
          indent: 30,
          columns: 2,
          height: 300,
          ellipsis: true
        });
      doc.image('./assets/but_graineasy.png', 5, 20, {width: 100})
        .text('Invoiced to Bajaj Pulse Mill', 5, 2);
  
     doc.pipe(res);
     doc.end();
});

router.post('/', [auth, permit('buyer', 'admin')],  async (req, res) => {

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const item = await Item.findById(req.body.itemId);
  if (!item) return res.status(400).send('Invalid Item.');

  const address = await Address.findById(req.body.addressId);
  if (!address) return res.status(400).send('Invalid address.');

  const buyer = await User.findById(req.body.buyerId);
  if (!buyer) return res.status(400).send('Invalid buyer.');

  const seller = await User.findById(req.body.sellerId);
  if (!seller) return res.status(400).send('Invalid seller.');

  let orderObj = _.pick(req.body, ['orderno','quantity',
  'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
  'receivedTime', 'paymentMode', 'status','ordertype','price']);

  orderObj.item =  item;
  orderObj.address =  address;
  orderObj.buyer =  buyer;
  orderObj.seller =  seller;
  let order = new Order(orderObj);
  order = await order.save();

  res.send(order);
});

router.put('/:id', [auth, permit('buyer', 'admin')], async (req, res) => {

  if (req.body.addressId) {
    const address = await Address.findById(req.body.addressId);
    if (!address) return res.status(400).send('Invalid category.');
  }


  let orderObj = _.pick(req.body, ['quantity',
  'cost', 'placedTime', 'confirmedTime', 'shipmentTime',
  'receivedTime', 'paymentMode', 'status']);

  if (req.body.addressId) {
    orderObj.address =  address;
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

router.get('/user/:id', [auth], async (req, res) => {
  // const order = await Order.findById(req.params.id);

  const customer = await User.findById(req.params.id);
  console.log(req.params.id);
  console.log(customer);
  if (!customer) return res.status(400).send('Invalid buyer.');
  let order = null;
  if (customer.isSeller) {
    order = await Order.find({seller: customer}).sort({'placedTime':-1});
  }
  else {
    order = await Order.find({buyer: customer}).sort({'placedTime':-1});
  }

  if (!order) return res.status(404).send('The item with the given ID was not found.');

  res.send(order);
});

module.exports = router;