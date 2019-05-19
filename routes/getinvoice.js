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
  const doc = new PDFDocument({ layout : 'portrait', margin: 5});
  var lorem = 'kfdshjkxbkbhdkjhbcn  gkdhfgkjhdfgkh'

  // Positions for x and y coordinates 

  var linestart = 20
  var textlabel_x = 25
  var textlabel_xx = 300
  var textdata_x = 80
  var textdata_xx = 360
  var secondlinetext = 360
  var firsthorznline = 580
  var horznlinefirst_y = 200
  var horznlinesecond_y = 220
  var horznlinethird_y = 380

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

      doc.image('./assets/images/graineasy.png', 10, 10, {width: 100})
        .text('Tax Invoice', 525, 10); 
      // Settings Address fields
        doc
        .fontSize(10)
        .moveDown() 
        .text('Seller',20,40);
      doc
        .text('Bill To',300,40);
      doc
        .text('Vendor Code',20);
      doc
        .moveUp()
        .text('Vendor Code',300);   
      doc
        .text('Address',20);  
      doc
        .moveUp() 
        .text('Address',300);    
      doc
        .moveDown() 
        .text('CIN',20);
      doc
        .moveUp()
        .text('GSTIN',300);   
      doc
        .text('Place of Supply',20);
      doc
        .moveUp()
        .text('Place of Billing',textlabel_xx);     
      doc
        .text('GSTIN',20); 
      doc
        .moveUp()
        .text('Ship To',300);  
      doc
        // .moveUp()
        .text('PO No',20); 
      doc
        .moveUp()
        .text('Address',300);     
        doc
        .text('PO Date',20);
        doc
        .text('Place of Delivery',300)
        doc
        .moveUp()
        .text('Invoice No.',20); 
        doc
        .text('GSTIN',300); 
        doc
        .moveUp()
        .text('Invoice Date',20);
        // doc
        // .text('Source',300); 
        // doc
        // .text('Destination',300);
        doc
        // .moveUp()
        .text('Reverse Charge Mechanism',20);
           

      // Specify field details here  
      doc  
        .text(': Funfact Emarketplace Private Limited',80,40)
      doc  
        .text(': ELITE TRADERS',360,40)  
      doc
        .text(': FUNFACT002',80); 
      doc
        .moveUp()
        .text(': ELITRAD102',360)  
      doc  
        .text(': NO 39/2, ITPL MAIN ROAD, MUNNEKOLAL, Bangalore 37',80,64,{
          width: 200,
          align: 'left'})    
      doc  
        .text(': NO.73/9,, 2ND MAIN ROAD,, N.T. PET,, Bengaluru , Karnataka, 560002',360,64,{
          width: 200,
          align: 'left'}) 
      doc 
        .text(': CIN No Here',80)      
      doc 
        .moveUp()
        .text(': 29AALFS8665E1ZK',360) 
      doc
        .text(': AGVPH1923R',100)    
      doc
        // .moveUp()
        .text(': WAREHOUSE 1',360)   
       doc
       .moveUp()
       .text(': 29AALFS8665E1ZK',80);
       doc
      // .moveUp()
      .text(': OR-123412',80);
       doc
       .text(': NO.73/9,, 2ND MAIN ROAD,, N.T. PET,, Bengaluru , Karnataka, 560002',360,123,{
        width: 200,
        align: 'left'}) 
      doc
      .moveUp()
      .text(': 03-05-2019',80);
      doc
      // .moveUp()
      .text(': 112212',80);
      doc
      // .moveUp()
      .text(': 04-05-2019',80);
      doc
      .moveUp()
      .text(': 29AALFS8665E1ZK',360);
      // doc
      // // .moveUp()
      // .text(': Bangalore,KN',360);
      doc
      // .moveUp()
      .text(': No',170);
      // doc
      // .moveUp()
      // .text(': Hyderabad,TN',360);
      doc.moveTo(20, 200)                               // set the current point
        .lineTo(580, 200)  
        .stroke();                                   // stroke the path
        doc.moveTo(20, 220)                               // set the current point
        .lineTo(580, 220)  
        .stroke();                                   // stroke the path
        doc.moveTo(20, 380)                               // set the current point
        .lineTo(580, 380)  
        .stroke();
        doc
        .fontSize(8)
        .text('Item No',30,205)
        doc
        .moveUp()
        .text('Description',70)
        doc
        .moveUp() 
        .text('HSN',130)
        doc
        .moveUp()
        .text('Qty',170)
        doc
        .moveUp()
        .text('Rate',210)
        doc
        .moveUp()
        .text('Gross Amount',250) 
        doc
        .moveUp()
        .text('Discount',310)
        doc
        .moveUp()
        .text('Net Amount',360)
        doc
        .moveUp()
        .text('Tax',470)
        doc
        .moveUp()
        .text('Amount',530)
        doc
        .moveDown(1)
        .text('CGST@2.5%',470)
        doc
        // .moveUp()
        .text('SGST@2.5%',470)
        doc
        // .moveUp()
        .text('IGST@2.5%',470)

        // Item Details

        doc
        .moveUp(2)
        .text('Item No',30)
        doc
        .moveUp()
        .text('Description',70)
        doc
        .moveUp() 
        .text('HSN',130)
        doc
        .moveUp()
        .text('Qty',170)
        doc
        .moveUp()
        .text('Rate',210)
        doc
        .moveUp()
        .text('Gross Amount',250) 
        doc
        .moveUp()
        .text('Discount',310)
        doc
        .moveUp()
        .text('Net Amount',360)
        // doc
        // .moveUp()
        // .text('Tax',470)
        // doc
        // .moveUp()
        // .text('Amount',530)
        doc
        .moveUp(2)
        .text('5000',530)
        doc
        // .moveUp()
        .text('5000',530)
        doc
        // .moveUp()
        .text('NA',530)

        // Additional Taxation details
        doc
        .moveDown(3)
        .text('Transport',470);
        doc
        // .moveDown(3)
        .text('Insurance',470);
        doc
        // .moveDown(3)
        .text('CESS',470);
        doc
        .moveDown(2)
        .text('Grand Total',470);

        doc
        .moveUp(6)
        .text('0',530);
        doc
        // .moveDown(3)
        .text('0',530);
        doc
        // .moveDown(3)
        .text('NA',530);
        doc
        .moveDown(2)
        .text('Rs. 825776',530);

        doc
        // .moveDown()
        // .fontSize(6)
        // .text("Sale Sale,Mega sale this month",500,50)   
      // doc.circle(280, 200, 50).fill('#6600FF');
      
      // doc.lineTo(20,400).fillAndStroke('#6600FF');
      // doc
      //   .text('Order Value ' + cost, 100, 300)
      //   .font('Times-Roman', 13)
      //   .moveDown()
      //   .text(lorem, {
      //     width: 412,
      //     align: 'justify',
      //     indent: 30,
      //     columns: 2,
      //     height: 300,
      //     ellipsis: true
      //   });
      doc
        .fontSize(6)
        .text('Certified that the particulars given above are true and correct and the amount indicated',180,400)
      doc
        .fontSize(6)
        .text('This is an electronically generated invoice. This does not require physical signature',180,420)
      doc 
        .fontSize(8)
        .text('For Funfact eMarkatplace Pvt Ltd',180,520)
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