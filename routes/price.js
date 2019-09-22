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
  let tax = item.name.tax ? (item.name.tax/100) : 0;
  let transporationPerKg = item.transporationPerKg ? item.transporationPerKg: 0;
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
  // Original Price Engine 
  // let P1 = quantity * (sellingPrice + /*transporationPerKg +*/ loadingPerKg + unloadingPerKg + packagingPerKg
  //                   + buyerFinePerKg);
  // let P2 = P1 * (1 + (buyerCreditCostPercent/100));
  // let P_invoice_rate = P2 * (1 + ((sellerFeePerKg + buyerFeePerKg + buyerMarginPerKg)/100));
  // /********************************/
  // let Num = ((P_invoice_rate * quantity) + (buyerDiscount2PerKg * quantity_dash) + buyerDiscount3Lumpsump) ;
  // let Den = ((quantity_dash) - ((buyerBackMarginPercent + buyerDiscount1Percent)* quantity_dash));
  // let P_gross = (((P_invoice_rate) + (buyerDiscount2PerKg * quantity_dash) + buyerDiscount3Lumpsump) / 
  //       ((quantity_dash) - ((buyerBackMarginPercent + buyerDiscount1Percent)* quantity_dash))) * quantity;
  // let p_final = P_gross * (1 + ((tax + insurance)/100));
  // console.log(quantity_dash, P1, P2, Num, Den, P_invoice_rate, P_gross, p_final);

  // Modified Pricing Engine
  let P1 = transporationPerKg + loadingPerKg + unloadingPerKg + buyerFinePerKg + packagingPerKg;  // Transaction Cost
  let P2 = P1 + sellingPrice; // Landing Cost
  let P3 = P2 * (buyerCreditCostPercent/100); //Credit Amount
  let P4 = P2 + P3; //Cost to Graineasy
  let P5 = buyerFeePerKg + sellerFeePerKg + buyerMarginPerKg;  // Profit
  let P6 = P4 + P5; //Invoice Rate
  let Q = quantity; // Quantity
  let Q_dash = Q * (1 - (buyerNetLossPercent/100)); //Quantity after loss 
  let D1 = (buyerDiscount1Percent/100) * P6;  //Discount 1 in percentage,%
  let B = (buyerBackMarginPercent)/100 * P6; // Back margin
  let D2 = buyerDiscount2PerKg; // Discout 2 in units
  let total_ded_before_D3  = P6 - (D1 + B + D2) ; // Total Deduction
  let gross_amt = Q_dash * total_ded_before_D3;  // Gross Amount
  let D3 = buyerDiscount3Lumpsump;  // Lump Sum discount
  let net_amt = gross_amt - D3;
  let net_payable = net_amt + (sellingPrice * tax) + insurance;

  // Balancing Formula
  // Y*Q'-(B+D1)*Q'*Y-D2*Q'-D3=P6*Q
  // or Y = [{P6*Q + D3 + D2*Q_dash}/[Q_dash{1 - (B + D1)}]]
  
  let Y = ((P6 * Q + D3 + D2*Q_dash) / (Q_dash *(1-((buyerBackMarginPercent)/100 + (buyerDiscount1Percent/100)))));
  let Y_dash = (1 - ((buyerDiscount1Percent/100) + (buyerBackMarginPercent/100))) * Y;
  let Y_final = Y_dash - buyerDiscount2PerKg;

  let gross_amt_using_y = Y_final * Q_dash;
  let net_payable_using_y = gross_amt_using_y + (sellingPrice * tax) + insurance;
  price  = {'price' : net_payable_using_y,
            'y' : Y,
            'qty' : Q,
            'P6' : P6,
            'net_payable' : net_payable,
            'y_price' : Y_final,
            'calculated_qty' : Q_dash};

  res.send(price);
});

module.exports = router;
