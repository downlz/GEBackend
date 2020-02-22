const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Bid, validate} = require('../models/bid');
const {AgentBid} = require('../models/agentbid');
const {Order} = require('../models/order');
const {BidHistory} = require('../models/bidhistory');
const {Address} = require('../models/address');
const {State} = require('../models/state');
const {Auction} = require('../models/auction');
const uuid = require('uuid')
const express = require('express');
const router = express.Router();
const _ = require('lodash');
var ObjectID = require("mongodb").ObjectID;
const {placeOrder} = require('./orders');
router.get('/', [auth, permit('seller', 'admin','buyer','agent')], async (req, res) => {
    const state = await Bid.find().populate(["auction", "user"]);
    return res.status(200).send(state);
});


router.get('/current', [auth, permit('seller', 'buyer', 'agent')], async (req, res) => {
    const state = await Bid.find({
        "createdBy": req.user._id
    }).sort({createdAt:-1}).populate({
        path: 'auction',
        model: 'Auction',
        populate: [
            {
                path: 'unit',
                model: 'Unit'
            },

            {
                path: 'user',
                model: 'User'
            },
            {
                path: 'sampleNo',
                model: 'Item'
            }

        ]
    });
    res.send(state);
});


router.post('/', [auth, permit('buyer', 'seller','agent')], async (req, res) => {
    try {
        // const {error} = validate(req.body);      // Disabling because of addition of onbehalf of buyer
        // console.log(error);
        // if (error) return res.status(400).send(error.details[0].message);
        console.log(req.body);
        const auction = await Auction.findById(req.body.auction);
        if (!auction) return res.status(400).send('InvalidAuction');

        let bid = new Bid({
            ...req.body
        });
        bid.createdBy = req.user._id;
        bid.createdAt = new Date();
        const alreadyPlacedBid = await Bid.findOne({
            createdBy: req.user._id,
            auction: req.body.auction
        });

        if (alreadyPlacedBid != null) {
            const bidHistoryItem = new BidHistory({
                ...alreadyPlacedBid.toJSON()
            });
            bidHistoryItem.save();
            alreadyPlacedBid.delete();
        }

        await bid.save();
        if (req.body.onbehalfofbuyer != null) {
            const partydtlObj = {
                bid : bid._id,
                partyname: req.body.onbehalfofbuyer,
                partyphone: req.body.phoneno,
                createdAt : Date()
            };
        let partydtl = new AgentBid(partydtlObj);
        partydtl = await partydtl.save();
        }
        return res.status(200).send(bid);
    } catch (e) {
        return res.status(500).send(e.message);
    }
});

// router.put('/:id', [auth, permit('buyer', 'seller')], async (req, res) => {
//
//     const bid = await Bid.findByIdAndUpdate(req.params.id, {...req.body}, {
//         new: true
//     }).populate(["auction"]);
//
//     if (!bid) return res.status(404).send('The bid with the given ID was not found.');
//
//     res.send(bid);
// });

router.delete('/:id', [auth, permit('buyer', 'seller')], async (req, res) => {
    const bid = await Bid.findByIdAndRemove(req.params.id);

    if (!bid) return res.status(404).send('The bid with the given ID was not found.');

    res.send(bid);
});

router.get('/:id', async (req, res) => {
    const bid = await Bid.findById(req.params.id).populate(["auction", "user"]);

    if (!bid) return res.status(404).send('The bid with the given ID was not found.');

    res.send(bid);
});

router.get('/bestbid/:id/type/:type', async (req, res) => {
    if (req.params.type == 'seller') {
        const bid = await Bid.find({'auction':req.params.id}).sort({price:-1}).limit(1);
        res.send(bid);                                      // Improve coding standards
    } else if (req.params.type == 'buyer') {
        console.log('here')
        var auctionid = new ObjectID(req.params.id);
        const bid = await Bid.aggregate([{ $match: { 'auction' : auctionid }},
              { $project : 
                {  
                  'actualprice' : '$price',  
                  'marketingExpense' : '$marketingExpense', 
                  'price' : {'$subtract' : [ '$price', { '$multiply' : ['$marketingExpense','$price', .01 ]}]}
                }
              }
            ]).sort({price:1}).limit(1);
        // find({'auction':req.params.id}).sort({price:1}).limit(1);
        res.send(bid);
    } else {
        // Do nothing as of now
    }
    if (!bid) return res.status(404).send('The bid with the given ID was not found.');
    
    
});

router.post('/confirmOrder/:id', [auth], async (req, res) => {
    try {
        const {id} = req.params;
        const bid = await Bid.findById(id).populate([
            {
                path: 'auction',
                model: 'Auction',
                populate: [
                    {
                        path: 'unit',
                        model: 'Unit'
                    },

                    {
                        path: 'user',
                        model: 'User'
                    },
                    {
                        path: 'sampleNo',
                        model: 'Item'
                    }
                ]
            },
            'createdBy'
        ]);
        let order = {};
        // console.log(bid);
        // console.log('******')

        const statename = await State.findById(bid.auction.state);
        // console.log(statename);
        // const orderno = await Order.find().sort({orderno: -1}).limit(1)

        // if (!orderno) return res.status(404).send('The item with the given ID was not found.');

        // order.orderno = uuid.v4();                          // to be updated with orderno logic.
        // order.orderno = String(parseInt(orderno[0].orderno) + 1);
        order.itemId = bid.auction.sampleNo._id.toString();
        
        order.unit = bid.auction.unit.mass;
        order.price = bid.price;
        //Order Address schema is different from what we capture in auction
        //order.address =
        order.status = 'new';
        // order.statedtl = statename;
        order.ordertype = 'auction';
        order.referenceAuctionId = bid.auction._id.toString();
        console.log(bid.createdBy.phone);
        if (bid.auction.auctionType == 'seller') {
            order.buyerId = bid.createdBy._id.toString();
            order.sellerId = bid.auction.user._id.toString();
            order.quantity = bid.quantity;
            order.isshippingbillingdiff = false;
            // const address = await Address.find({ $and : [{addresstype : 'registered'},{phone: req.params.phone}]});
        } else {
            order.quantity = bid.auction.availableQty;
            order.sellerId = bid.createdBy._id.toString();
            order.buyerId = bid.auction.user._id.toString();
            order.address = {
                text: bid.auction.address,
                pin: bid.auction.pincode,
                state: statename,
            }
        }
        order.placedTime = new Date().toISOString();
        order.cost = order.price * order.quantity;
        // console.log(order);
        await placeOrder(order, req, res);
        bid.orderConfirmed = true;
        await bid.save();
    } catch (e) {
        console.log(e);
        return res.status(500).send(e.message);
    }
});

router.get('/agentbid/:id', [auth, permit('seller', 'buyer', 'agent')], async (req, res) => {
    const agentbiddtl = await AgentBid.find({'bid':req.params.id});

    if (!agentbiddtl) return res.status(404).send('The agent buyer details for requested bid was not found.');

    res.send(agentbiddtl);
});

module.exports = router;
