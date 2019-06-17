const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Order} = require('../models/order');
const {Item} = require('../models/item');
const {Taxrate} = require('../models/taxrates');
const {User} = require('../models/user');
const {State} = require('../models/state');
// const mongoose = require('mongoose');
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

  var textlabel_x = 20
  // var textlabel_x = 25
  var firstline_y = 40
  var textlabel_xx = 300
  var textdata_x = 90
  var textdata_xx = 375
  var secondlinetext = 360
  var firsthorznline = 580
  var horznlinefirst_y = 220
  var horznlinetext_y = horznlinefirst_y + 5
  var horznlinesecond_y = horznlinefirst_y + 20
  var horznlinethird_y = horznlinefirst_y + 180
  var certifyline = horznlinethird_y + 40
  var termsline = certifyline + 20
  var companyline = termsline + 160
  var footerpos = 180
  
  const cgstresponse = await Taxrate.find({type:'cgst'});        // append date based on order
  const igstresponse = await Taxrate.find({type:'igst'});
  const sgstresponse = await Taxrate.find({type:'sgst'});
  
  // console.log(cgstresponse[0].ratepct);
  // console.log('***********');
  const result = await Order.findById(id);
  console.log(result);
  
  // Logic to get shipping address
  if (result.isshippingbillingdiff == true) {
    shipper = {
                partyname :  result.shippingaddress.addressbasicdtl.partyname,
                gstin:  result.shippingaddress.addressbasicdtl.gstin,
                addressline:  result.shippingaddress.text,
                state:  result.shippingaddress.state.name,
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
                  
               
                    
                  
  // const statedtl = await State.findById(result.Addresses.state); 
      
      title        = result.orderno,
      quantity      = result.quantity;
      cost = result.cost;
      placedTime  = result.placedTime;
      confirmedTime         = result.status;
      ordertype         = result.ordertype;

      // console.log(result.seller.Addresses[0].state);
      // console.log('**********');
      // console.log(result.buyer.Addresses[0]);

      // Calculating tax, apply logic to calculate igst and sgst

      cgst = (cgstresponse[0].ratepct/100) * parseInt(result.cost);
      if (result.seller.Addresses[0].state.code == result.buyer.Addresses[0].state.code) {
        sgst = (sgstresponse[0].ratepct/100) * parseInt(result.cost);
        igst = 0
      } else {
        igst = (igstresponse[0].ratepct/100) * parseInt(result.cost);
        sgst = 0
      }
  
      filename     = encodeURIComponent('PO-' + title) + '.pdf';
      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');
      
      // console.log(result);
      
      doc.image('./assets/images/gelogo.jpeg', 5, 5, {width: 50})
        .text('Purchase Order', 500, 10); 
      
        // Column 1 fields
      doc
      .fontSize(8)
      .text('Graineasy PAN',textlabel_x,firstline_y);  
      doc
      .text('Graineasy GSTIN',textlabel_x);  
      doc
      .text('Graineasy CIN',textlabel_x);  
        
        doc
        .fontSize(10)
        .moveDown(1)
        .text('Order No.',textlabel_x);
        
      doc
        .moveDown(3)
        .text('Seller',textlabel_x);
      doc
        // .moveUp()
        .text('Address',textlabel_x);   
      doc
        .moveDown(1)
        .text('Origin',textlabel_x);  
      doc
        .moveDown(1)
        .text('PAN',textlabel_x);
      doc
        .text('GSTIN',textlabel_x);
      // doc                                        // Disabled not needed as of now
      //   .text('CIN',textlabel_x);   
      
      // Column 2 labels
      // For company pan details
      // doc
      // .fontSize(8)
      // .text(' ',textlabel_xx,firstline_y);
      // doc
      // .text(' ',textlabel_xx,firstline_y);
      // doc
      // .text(' ',textlabel_xx,firstline_y);
      doc
      .fontSize(10)                              
      .text('Order date(PO)',textlabel_xx,firstline_y);
      doc
      .text('Delivery date',textlabel_xx);
      doc
      .text('Expiry date',textlabel_xx);
      doc
        .moveDown(1)
        .text('Bill To',textlabel_xx);
      doc
        // .moveUp()
        .text('Address',textlabel_xx);     
      doc
        .moveDown(1)
        .text('GSTIN',textlabel_xx); 
      
      doc
        .text('Ship To',textlabel_xx);
      doc
        // .moveUp()
        .text('Address',textlabel_xx);     
      doc
        .moveDown(1)
        .text('GSTIN',textlabel_xx);   
      doc
        .moveDown(1)
        .text('Place of Supply',textlabel_xx);
        doc
        .text('State code',textlabel_xx);  
        

      // // Specify field details here  
      doc
      .fontSize(8)
      .text(': ABC1234567',textdata_x,firstline_y);       // Default to grain easy details as of now
      doc
      .text(': QWERTY789012345',textdata_x);  
      doc
      .text(': AGHGBNBJHKKJK',textdata_x);  

       doc
       .fontSize(10)
       .moveDown(1)
      .text(': OR-'+ result.orderno,textdata_x);
      doc 
        .moveDown(3) 
        .text(': ' + result.seller.name,textdata_x)  
      // Address and Origin line moved at bottom
      doc
        .moveDown(4)
        .text(': ' + result.seller.pan,textdata_x)   
        
        doc 
        .text(': ' + result.seller.GST,textdata_x)
      //    doc                                       Disabling seller's cin as of now
      // //  .moveUp()
      //  .text(': ' + result.seller.cin,textdata_x);    
      // doc 
      //   // .moveUp()
      //   .text(': WAREHOUSE 1',360)   
      
      // ******************** 2nd Column Data *******************
      // //  doc
      // //  .text(': NO.73/9,, 2ND MAIN ROAD,, N.T. PET,, Bengaluru , Karnataka, 560002',360,123,{
      // //   width: 200,
      // //   align: 'left'}) 
      doc
      // .moveDown()
      .text(': ' + moment(result.placedTime).format('DD-MM-YYYY'),textdata_xx,firstline_y);
      // doc
      // // .moveUp()
      // .text(': 112212',80);
      doc
      .text(': ' + moment(result.placedTime).add(6, 'days').format('DD-MM-YYYY'),textdata_xx);
      doc
      .text(': ' + moment(result.placedTime).add(8, 'days').format('DD-MM-YYYY'),textdata_xx);
      
      doc  
        .moveDown(1)
        .text(': ' + result.buyer.name,textdata_xx)
        // Removing address field and pasting at last
        // doc  
        // .text(': ' + result.buyer.Addresses[0].text + ', ' + result.buyer.Addresses[0].city.name + ', ' + result.buyer.Addresses[0].city.state.name+ ', ' + result.buyer.Addresses[0].pin,textdata_xx,80,{
        //     width: 200,
        //     align: 'left'})    
        doc
         .moveDown(2)
         .text(': ' + result.buyer.GST,textdata_xx);   
         doc  
         .text(': ' + shipper.partyname,textdata_xx);    
         // Shipper address line moved at bottom
         
        doc                              // cin data section
        .moveDown(2)
        .text(': ' + shipper.gstin,textdata_xx)   
        doc 
        .moveDown(1)
        .text(': '+ result.seller.Addresses[0].state.name,textdata_xx)  
        doc 
        .text(': '+ result.seller.Addresses[0].state.code,textdata_xx)  
      

      doc.moveTo(20, horznlinefirst_y)                               // set the current point
        .lineTo(firsthorznline, horznlinefirst_y)  
        .stroke();                                   // stroke the path
        doc.moveTo(20, horznlinesecond_y)                               // set the current point
        .lineTo(firsthorznline, horznlinesecond_y)  
        .stroke();                                   // stroke the path
        doc.moveTo(20, horznlinethird_y)                               // set the current point
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
        .text('CGST@' + cgstresponse[0].ratepct,470)
        doc
        // .moveUp()
        .text('SGST@' + sgstresponse[0].ratepct,470)
        doc
        // .moveUp()
        .text('IGST@' + igstresponse[0].ratepct,470)

        // Item Details Values

        doc
        .moveUp(2)
        .text(result.item.sampleNo,30)
        doc
        .moveUp()
        .text(result.item.name.name + ',' + result.item.category.name,70)
        doc
        .moveUp() 
        .text(result.item.name.hsn,130)       
        doc
        .moveUp()
        .text(result.quantity + ' ' + result.unit,170)
        doc
        .moveUp()
        .text(result.price,210)
        doc
        .moveUp()
        .text(result.cost,250) 
        doc
        .moveUp()
        .text(result.discount,310)
        doc
        .moveUp()
        .text(result.cost-result.discount,360)
        // doc
        // .moveUp()
        // .text('Tax',470)
        // doc
        // .moveUp()
        // .text('Amount',530)
        doc
        .moveUp(2)
        .text(cgst,530)
        doc
        // .moveUp()
        .text(sgst,530)
        doc
        // .moveUp()
        .text(igst,530)

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
        .text(result.transportcost,530);
        doc
        // .moveDown(3)
        .text(result.insurancecharges,530);
        doc
        // .moveDown(3)
        .text('NA',530);
        doc
        .moveDown(2)
        .text((parseInt(result.cost)+cgst+igst+sgst + result.transportcost + result.insurancecharges).toFixed(2),530);

      doc
        .fontSize(6)
        .text('Certified that the particulars given above are true and correct and the amount indicated',footerpos,certifyline)
      doc
        .fontSize(6)
        .text('Payment Terms-x days from date of order/ delivery',footerpos,termsline)
      doc 
        .fontSize(8)
        .text('For Funfact eMarkatplace Pvt Ltd',footerpos,companyline)
        doc.pipe(res);
        doc  
        .fontSize(10)
        .text(': ' + result.buyer.Addresses[0].text + ', ' + result.buyer.Addresses[0].city.name + ', ' + result.buyer.Addresses[0].city.state.name+ ', ' + result.buyer.Addresses[0].pin,textdata_xx,98,{
            width: 200,
            align: 'left'})  
        doc  
            // .text(': Address line here',textdata_xx)      
          .text(': ' + shipper.addressline + ', ' + shipper.state + ', ' + shipper.pin,textdata_xx, 144,{
            width: 200,
            align: 'left'})  
          doc
            // .text(': Address line goes here',textdata_x)
            .text(': ' + result.seller.Addresses[0].text + ', ' + result.seller.Addresses[0].city.name + ', ' + result.seller.Addresses[0].city.state.name+ ', ' + result.seller.Addresses[0].pin,textdata_x,137,{
              width: 200,
              align: 'left'})
          doc
            .moveDown(1)
            // .text(': Origin address goes here',textdata_x)  
            .text(': ' + result.item.address.text + ', ' + result.item.address.city.name + ', ' + result.item.address.pin,textdata_x,160,{
              width: 200,
              align: 'left'})    
     doc.end();
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