const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Order} = require('../models/order');
const {Item} = require('../models/item');
const {User} = require('../models/user');
const {State} = require('../models/state');
// const {Taxrate} = require('../models/taxrates');
const {getTaxBreakup} = require('./orders');
const mongoose = require('mongoose');
const express = require('express');
const moment = require('moment');
const router = express.Router();
const _ = require('lodash');
const PDFDocument = require('pdfkit');


router.get('/:id', async (req, res) => {
  id  = req.params.id;
  const doc = new PDFDocument({ layout : 'portrait', margin: 5});
  var lorem = 'kfdshjkxbkbhdkjhbcn  gkdhfgkjhdfgkh'

  // Positions for x and y coordinates 

  // var linestart = 20
  var textlabel_x = 20
  // var textlabel_x = 25
  var firstline_y = 40
  var textlabel_xx = 300
  var textdata_x = 90
  var textdata_xx = 375
  var secondlinetext = 360
  var firsthorznline = 580
  var horznlinefirst_y = 220
  var horznlinetext_y = 225
  var horznlinesecond_y = 240
  var horznlinethird_y = 400
  var certifyline = 420
  var invoiceline = 440
  var companyline = 600
  var footerpos = 180

  // const cgstresponse = await Taxrate.find({type:'cgst'});        // append date based on order
  // const igstresponse = await Taxrate.find({type:'igst'});
  // const sgstresponse = await Taxrate.find({type:'sgst'});

  const result = await Order.findById(id);
  
  if (result.reversechargemech == false){
    revmech = 'No'
  } else {
    revmech = 'Yes'
  }
  discount = 0;
  if (result.item.isTaxable == true){
    taxObj = await getTaxBreakup(result);
    cgst = taxObj.cgst;
    sgst = taxObj.sgst;
    igst = taxObj.igst;
  } else {
    taxObj = {}
    taxObj.taxrates = [0,0,0]
    cgst = 0;
    sgst = 0;
    igst = 0;
  }
  // Logic to get shipping address
  // console.log(result);


  if (result.isshippingbillingdiff == true) {
    shipper = {
                partyname :  result.shippingaddress.addressbasicdtl.partyname,
                gstin:  result.shippingaddress.addressbasicdtl.gstin,
                addressline:  result.shippingaddress.text,
                state:  result.shippingaddress.state.name,
                statecode: result.shippingaddress.state.code,
                pin:  result.shippingaddress.pin,
                phone:  result.shippingaddress.phone
    }
  } else if (result.isshippingbillingdiff == undefined){
    shipper = {
      partyname :  result.buyer.name,
      gstin: result.buyer.GST,
    addressline: result.buyer.Addresses[0].text,
    city: result.buyer.Addresses[0].city.name,
    state: result.buyer.Addresses[0].city.state.name,
    pin: result.buyer.Addresses[0].pin,
    phone: result.buyer.phone
    }
  } else {
    shipper = {
      partyname : result.buyer.name,
                     gstin: result.buyer.GST,
                     text: result.address.text,
                     state: result.address.state.name,
                     pin: result.address.pin,
                     phone: result.buyer.phone
    }
  }

  const getstatecode = await State.find({
    'name': shipper.state
  }).select('code');

  // const statedtl = await State.findById(result.Addresses.state);    

      title        = result.orderno,
      quantity      = result.quantity;
      cost = result.cost;
      placedTime  = result.placedTime;
      confirmedTime         = result.status;
      ordertype         = result.ordertype;
      filename     = encodeURIComponent('INV-' + title) + '.pdf';
      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');

      doc.image('./assets/images/gelogo.jpeg', 5, 5, {width: 50})
        .text('Tax Invoice', 525, 10); 
      // First Column Label
      doc
        .fontSize(10)
        .text('Seller',textlabel_x,firstline_y);
      doc
        .text('Vendor Code',textlabel_x); 
      doc
        .text('Address',textlabel_x);    
      doc
        .moveDown(1) 
        .text('CIN',textlabel_x);
      doc
        .text('Place of Supply',textlabel_x);
      doc
        .text('State Code',textlabel_x);  
      doc
        .text('GSTIN',textlabel_x); 
      doc
        .moveDown(1)
        .text('PO No',textlabel_x); 
        
        doc
        .text('PO Date',textlabel_x);
        
        doc
        // .moveUp()
        .text('Invoice No.',textlabel_x); 
        
        doc
        // .moveUp()
        .text('Invoice Date',textlabel_x);
        doc
        // .moveUp()
        .text('Reverse Charge Mechanism',textlabel_x);
      
      // ************* 2nd Column Labels ****************
      
      doc
        .text('Bill To',textlabel_xx,firstline_y);
        doc
        // .moveUp()
        .text('Vendor Code',textlabel_xx);   
        doc
        // .moveUp() 
        .text('Address',textlabel_xx);  
        doc
        .moveDown(1)
        .text('GSTIN',textlabel_xx);   
        // doc
        // // .moveUp()
        // .text('Place of Billing',textlabel_xx); 
        doc
        .moveDown(1)
        .text('Ship To',textlabel_xx);     
        doc
        // .moveUp()
        .text('Address',textlabel_xx);   
        doc
        .moveDown(1)
        .text('GSTIN',textlabel_xx); 
        doc
        .text('Place of Delivery',textlabel_xx)
        doc
          .text('State Code', textlabel_xx);

      // **************** Specify field details here ****************

      // **************** First Column Data ******************


      doc  
        .text(': Funfact Emarketplace Private Limited',textdata_x,firstline_y)
      doc
        .text(': ' + result.seller.vendorCode,textdata_x); 
      
      // doc  
      //   .text(': NO 39/2, ITPL MAIN ROAD, MUNNEKOLAL, Bangalore 37',textdata_x,53,{
      //     width: 200,
      //     align: 'left'})    
      
      doc 
        .moveDown(2)
        .text(': U74999BR2018PTC036772',textdata_x)      
      
      doc
        .text(': ' + result.seller.Addresses[0].state.name,textdata_x)    
        doc
        .text(': ' + result.seller.Addresses[0].state.code,textdata_x)    
       doc
      //  .moveDown(1)
       .text(': 29AALFS8665E1ZK',textdata_x);
       
       doc
       .moveDown(1)
       .text(': OR-'+ result.orderno,textdata_x);
       doc
      // .moveUp()
      .text(': ' + moment(result.confirmedTime).format('DD-MM-YYYY'),textdata_x);
      doc
      // .moveUp()
      .text(': ' + result.invoiceno,textdata_x);
      doc
      // .moveUp()
      .text(': ' + moment(result.readyTime).format('DD-MM-YYYY'),textdata_x);
     
      // doc
      // // .moveUp()
      // .text(': Bangalore,KN',360);
      doc
      // .moveUp()
      .text(': '+ revmech,textdata_x+55);
      // doc
      // .moveUp()
      // .text(': Hyderabad,TN',360);
      // **************** Second Column Data ******************
      doc  
        .text(': ' + result.buyer.name,textdata_xx,firstline_y)  
        doc
        // .moveUp()
        .text(': ' + result.buyer.vendorCode,textdata_xx)    
        // doc  
        // .text(': NO.73/9,, 2ND MAIN ROAD,, N.T. PET,, Bengaluru , Karnataka, 560002',360,64,{
        //   width: 200,
        //   align: 'left'}) 
        doc 
          .moveDown(2)
          .text(': ' + result.buyer.GST,textdata_xx)    
        doc
        .moveDown(1)
        .text(': ' + shipper.partyname,textdata_xx)  
        // doc
        // // .moveUp()
        // .text(': OR-123412',80);
        //  doc
        //  .text(': NO.73/9,, 2ND MAIN ROAD,, N.T. PET,, Bengaluru , Karnataka, 560002',360,123,{
        //   width: 200,
        //   align: 'left'}) 
          doc
          .moveDown(2)         
          .text(': ' + shipper.gstin,textdata_xx);
          doc
          .text(': ' + shipper.state,textdata_xx);
          doc                                              // Add delivery code
          .text(': ' + getstatecode[0].code, textdata_xx);
      // ******************* Itemised bill ********************
      doc.moveTo(textlabel_x, horznlinefirst_y)                               // set the current point
        .lineTo(firsthorznline, horznlinefirst_y)  
        .stroke();                                   // stroke the path
        doc.moveTo(textlabel_x, horznlinesecond_y)                               // set the current point
        .lineTo(firsthorznline, horznlinesecond_y)  
        .stroke();                                   // stroke the path
        doc.moveTo(textlabel_x, horznlinethird_y)                               // set the current point
        .lineTo(firsthorznline, horznlinethird_y)  
        .stroke();
        doc
        .fontSize(8)
        .text('Item No',30,horznlinetext_y)
        doc
        .moveUp()
        .text('Description',70)
        doc
        .moveUp() 
        .text('HSN',140)
        doc
        .moveUp()
        .text('Qty',200)
        doc
        .moveUp()
        .text('Rate',250)
        doc
        .moveUp()
        .text('Gross Amount',290) 
        doc
        .moveUp()
        .text('Discount',350)
        doc
        .moveUp()
        .text('Net Amount',400)
        doc
        .moveUp()
        .text('Tax',470)
        doc
        .moveUp()
        .text('Amount',530)
        doc
        .moveDown(1)
        .text('CGST@' + taxObj.taxrates[0],470)
        doc
        // .moveUp()
        .text('SGST@' + taxObj.taxrates[1],470)
        doc
        // .moveUp()
        .text('IGST@' + taxObj.taxrates[2],470)

        // Item Details

        doc
        .moveUp(2)
        .text(result.item.sampleNo,30)
        doc
        .moveUp()
        .text(result.item.name.name + ',' + result.item.category.name,70)
        doc
        .moveUp() 
        .text(result.item.name.hsn,140)
        doc
        .moveUp()
        .text(result.quantity + ' ' + result.unit,200)
        doc
        .moveUp()
        .text(result.price,250)
        doc
        .moveUp()
        .text(result.cost.toFixed(2),290) 
        doc
        .moveUp()
        .text(result.discount,350)
        doc
        .moveUp()
        .text((result.cost-result.discount).toFixed(2),400)
        // doc
        // .moveUp()
        // .text('Tax',470)
        // doc
        // .moveUp()
        // .text('Amount',530)
        doc
        .moveUp(2)
        .text(cgst.toFixed(2),530)
        doc
        // .moveUp()
        .text(sgst.toFixed(2),530)
        doc
        // .moveUp()
        .text(igst.toFixed(2),530)

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
        .text(result.transportcost ,530);
        doc
        // .moveDown(3)
        .text(result.insurancecharges,530);
        doc
        // .moveDown(3)
        .text('NA',530);
        doc
        .moveDown(2)
        .text('Rs.'+(parseInt(result.cost)+cgst+igst+sgst + result.transportcost + result.insurancecharges).toFixed(2),530);
      doc
        .fontSize(6)
        .text('Certified that the particulars given above are true and correct and the amount indicated',footerpos,certifyline)
      doc
        .fontSize(6)
        .text('This is an electronically generated invoice. This does not require physical signature',footerpos,invoiceline)
      doc 
        .fontSize(8)
        .text('For Funfact eMarkatplace Pvt Ltd',footerpos+30,companyline)
        doc.pipe(res);
      
        doc  
        .fontSize(10)
        .text(': ' + result.buyer.Addresses[0].text + ', ' + result.buyer.Addresses[0].city.name + ', ' + result.buyer.Addresses[0].city.state.name+ ', ' + result.buyer.Addresses[0].pin,textdata_xx,65,{
            width: 200,
            align: 'left'})  
        doc  
            // Shipping address
          .text(': ' + shipper.addressline + ', ' + shipper.state + ', ' + shipper.pin,textdata_xx, 121,{
            width: 200,
            align: 'left'})  
          doc
            // .text(': Address line goes here',textdata_x)
            .text(': ' + result.seller.Addresses[0].text + ', ' + result.seller.Addresses[0].city.name + ', ' + result.seller.Addresses[0].city.state.name+ ', ' + result.seller.Addresses[0].pin,textdata_x,65,{
              width: 200,
              align: 'left'})  
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