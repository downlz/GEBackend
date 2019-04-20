const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Auction, validate} = require('../models/auction');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
    const state = await Auction.find()
    res.send(state);
});


router.post('/', [auth, permit('admin')], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const itemName = await Auction.findById(req.body.itemName);
    if (!itemName) return res.status(400).send('Invalid Item name.');

    const category = await Auction.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category name.');

    let auction = new Auction({
        ...req.body
    });
    auction.createdBy = req.user;
    auction.createdOn = new Date();
    auction.save();
    res.send(auction);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const auction = await Auction.findByIdAndUpdate(req.params.id, {...req.body}, {
        new: true
    });

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
