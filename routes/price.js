const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Item} = require('../models/item'); 
const {User} = require('../models/user'); 
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.post('/', [auth],  async (req, res) => {
  const item = await Item.findById(req.body.itemId);
  if (!item) return res.status(400).send('Invalid Item.');

  const buyer = await User.findById(req.body.buyerId);
  if (!buyer) return res.status(400).send('Invalid buyer.');

  const seller = await User.findById(req.body.sellerId);
  if (!seller) return res.status(400).send('Invalid seller.');

  const quantity = req.body.qty;

  // price calculation engine 
  let sellingPrice = item.price;
  let tax = item.name.tax ? item.name.tax : 0;
  //let transporationPerKg = item.transporationPerKg ? item.transporationPerKg: 0;
  let insurance = seller.Addresses[0].city.insurance ? seller.Addresses[0].city.insurance : 0;
  let loadingPerKg = seller.Addresses[0].city.loadingPerKg ? seller.Addresses[0].city.loadingPerKg: 0;
  let unloadingPerKg = buyer.Addresses[0].city.unloadingPerKg ? buyer.Addresses[0].city.unloadingPerKg: 0;
  let packagingPerKg = seller.Addresses[0].city.packagingPerKg ? seller.Addresses[0].city.packagingPerKg: 0;
  let sellerFeePerKg = seller.sellerFeePerKg ? seller.sellerFeePerKg: 0;
  let buyerFeePerKg = buyer.buyerFeePerKg ? buyer.buyerFeePerKg : 0;
  let buyerMarginPerKg = buyer.buyerMarginPerKg ? buyer.buyerMarginPerKg : 0;
  let buyerCreditCostPercent = buyer.buyerCreditCostPercent ? buyer.buyerCreditCostPercent : 0;
  let buyerBackMarginPercent = buyer.buyerBackMarginPercent ? buyer.buyerBackMarginPercent : 0;
  let buyerNetLossPercent = buyer.buyerNetLossPercent ? buyer.buyerNetLossPercent : 0;
  let buyerDiscount1Percent = buyer.buyerDiscount1Percent ? buyer.buyerDiscount1Percent : 0;
  let buyerDiscount2PerKg = buyer.buyerDiscount2PerKg ? buyer.buyerDiscount2PerKg : 0;
  let buyerDiscount3Lumpsump = buyer.buyerDiscount3Lumpsump ? buyer.buyerDiscount3Lumpsump : 0;
  let buyerFinePerKg = buyer.buyerFinePerKg ? buyer.buyerFinePerKg : 0;

  let quantity_dash = quantity * (1 - (buyerNetLossPercent/100));

  let P1 = quantity * (sellingPrice + /*transporationPerKg +*/ loadingPerKg + unloadingPerKg + packagingPerKg
                    + buyerFinePerKg);
  let P2 = P1 * (1 + (buyerCreditCostPercent/100));
  let P_invoice_rate = P2 * (1 + ((sellerFeePerKg + buyerFeePerKg + buyerMarginPerKg)/100));
  /********************************/
  let Num = ((P_invoice_rate * quantity) + (buyerDiscount2PerKg * quantity_dash) + buyerDiscount3Lumpsump) ;
  let Den = ((quantity_dash) - ((buyerBackMarginPercent + buyerDiscount1Percent)* quantity_dash));
  let P_gross = (((P_invoice_rate) + (buyerDiscount2PerKg * quantity_dash) + buyerDiscount3Lumpsump) / 
        ((quantity_dash) - ((buyerBackMarginPercent + buyerDiscount1Percent)* quantity_dash))) * quantity;
  let p_final = P_gross * (1 + ((tax + insurance)/100));
  // console.log(quantity_dash, P1, P2, Num, Den, P_invoice_rate, P_gross, p_final);
  // console.log()
  price  = {'price' : p_final};
  console.log(price);
  res.send(price);
});

module.exports = router;
