const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Auction, validate} = require('../models/auction');
const {ItemName} = require('../models/itemname');
const {Item} = require('../models/item');
const {Category} = require('../models/category');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', [auth], async (req, res) => {
    const state = await Auction.find().populate(["sampleNo", "user", "unit",]);
    res.send(state);
});


router.get('/current', [auth], async (req, res) => {
    const state = await Auction.find({
        "user": req.user._id
    }).populate(["sampleNo", "user", "unit",]);
    res.send(state);
});


router.post('/', [auth, permit('admin', 'seller')], async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        if (req.user.isAdmin) {
            const itemName = await ItemName.findById(req.body.itemName);
            if (!itemName) return res.status(400).send('Invalid Item name.');

            const category = await Category.findById(req.body.itemCategory);
            if (!category) return res.status(400).send('Invalid Category.');
        }
        const item = await Item.findById(req.body.sampleNo);
        if (!item) return res.status(400).send('Invalid sample no.');

        let auction = new Auction({
            ...req.body
        });
        if (req.user.isSeller) {
            auction.itemCategory = item.category._id;
            auction.itemName = item.name._id;
            auction.user = req.user._id;
        }
        auction.createdBy = req.user._id;
        auction.createdAt = new Date();
        await auction.save();
        return res.status(200).send(auction);
    } catch (e) {
        return res.status(500).send(e.message);
    }
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {

    const auction = await Auction.findByIdAndUpdate(req.params.id, {...req.body}, {
        new: true
    }).populate(["sampleNo", "user", "unit",]);

    if (!auction) return res.status(404).send('The genre with the given ID was not found.');

    res.send(auction);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
    const auction = await Auction.findByIdAndRemove(req.params.id);

    if (!auction) return res.status(404).send('The genre with the given ID was not found.');

    res.send(auction);
});

router.get('/:id', async (req, res) => {
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).send('The genre with the given ID was not found.');

    res.send(auction);
});

module.exports = router;
