const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Bid, validate} = require('../models/bid');
const {Order} = require('../models/order');
const {BidHistory} = require('../models/bidhistory');
const {Auction} = require('../models/auction');
const uuid = require('uuid')
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', [auth, permit('seller', 'admin')], async (req, res) => {
    const state = await Bid.find().populate(["auction", "user"]);
    return res.status(200).send(state);
});


router.get('/current', [auth, permit('seller', 'buyer')], async (req, res) => {
    const state = await Bid.find({
        "createdBy": req.user._id
    }).populate({
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


router.post('/', [auth, permit('buyer', 'seller')], async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
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
        let order = new Order();
        order.orderNo = uuid.v4();
        order.item = bid.auction.sampleNo;
        order.quantity = bid.quantity;
        order.unit = bid.auction.unit;
        order.cost = bid.price;
        order.price = bid.price;
        //Order Address schema is different from what we capture in auction
        //order.address =
        order.status = 'confirmed';
        order.ordertype = 'auction';
        order.referenceAuction = bid.auction;
        await order.save();
        return res.status(200).send(order);
    } catch (e) {
        return res.status(500).send(e.message);
    }
});

module.exports = router;
