const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Item, validate} = require('../models/item');
const {Category} = require('../models/category');
const {ItemName} = require('../models/itemname');
const {City} = require('../models/city');
const {User} = require('../models/user');
const {Unit} = require('../models/unit');
const {Manufacturer} = require('../models/manufacturer');
const {Address, validateAddress} = require('../models/address');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const _ = require('lodash');


function dropIfDNE(Obj, arr) {
    for (var i = 0, size = arr.length; i < size; i++) {
        if (!Obj[arr[i]]) delete Obj[arr[i]];
    }
}

router.get('/', async (req, res) => {
    const item = await Item.find().sort('price');
    res.send(item);
});

/**
 * Api to get listings by category id
 */
router.get('/byCategory/:category', async (req, res) => {
    const state = await Item.find({
        'category._id': req.params.category
    }).sort('name.name');
    res.send(state);
});


/**
 * Api to get current  user listings
 */
router.get('/current/', [auth], async (req, res) => {
    const state = await Item.find({
        'seller._id': req.user._id
    }).sort('name.name');
    res.send(state);
});


router.post('/', [auth, permit('seller', 'admin')], async (req, res) => {

    let itemObj = _.pick(req.body, ['image',
        'qty', 'price', 'moisture', 'grainCount', 'grade', 'sampleNo', 'origin', 'isLive', 'specs']);
    dropIfDNE(itemObj, ['image', 'qty', 'price', 'moisture', 'graincount', 'grade', 'sampleNo', 'origin', 'isLive', 'specs']);

    const {error} = validate(req.body);
    console.log(error)
    if (error) return res.status(400).send(error.details[0].message);

    const category = await Category.findById(req.body.categoryId);
    console.log(category);
    if (!category) return res.status(400).send('Invalid customer.');

    const name = await ItemName.findById(req.body.nameId);
    if (!name) return res.status(400).send('Invalid category.');

    const city = await City.findById(req.body.cityId);
    if (!city) return res.status(400).send('Invalid city.');

    const address = await Address.findById(req.body.addressId);
    if (!address) return res.status(400).send('Invalid address');

    const seller = await User.findById(req.body.sellerId);
    if (!seller) return res.status(400).send('Invalid seller');

    const unit = await Unit.findById(req.body.unitId);
    if (!unit) return res.status(400).send('Invalid unit.');

    const manufacturer = await Manufacturer.findById(req.body.manufacturerId);
    if (!manufacturer) return res.status(400).send('Invalid Manufacturer');

    itemObj.category = category;
    itemObj.name = name;
    itemObj.city = city;
    itemObj.address = address;
    itemObj.seller = seller;
    itemObj.unit = unit;
    itemObj.manufacturer = manufacturer;

    let item = new Item(itemObj);
    console.log(item)
    item = await item.save();

    res.send(item);
});

router.put('/:id', [auth, permit('seller', 'admin')], async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const category = await Category.findOne({name: req.body.categoryId});
    if (!category) return res.status(400).send('Invalid customer.');

    const name = await ItemName.findById(req.body.nameId);
    if (!name) return res.status(400).send('Invalid category.');

    const city = await City.findById(req.body.cityId);
    if (!city) return res.status(400).send('Invalid city.');

    const address = await Address.findById(req.body.addressId);
    if (!address) return res.status(400).send('Invalid address');

    const seller = await User.findById(req.body.sellerId);
    if (!seller) return res.status(400).send('Invalid seller');

    const unit = await Unit.findById(req.body.unitId);
    if (!unit) return res.status(400).send('Invalid unit.');

    itemObj = _.pick(req.body, ['name', 'image',
        'qty', 'price', 'moisture', 'grainCount', 'grade', 'sampleNo', 'origin', 'isLive']);

    itemObj.category = category;
    itemObj.name = name;
    itemObj.city = city;
    itemObj.address = address;
    itemObj.seller = seller;
    itemObj.unit = unit;

    const item = await Item.findByIdAndUpdate(req.params.id, itemObj, {
        new: true
    });

    if (!item) return res.status(404).send('The item with the given ID was not found.');

    res.send(item);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
    const item = await Item.findByIdAndRemove(req.params.id);

    if (!item) return res.status(404).send('The item with the given ID was not found.');

    res.send(item);
});

router.get('/:id', [auth], async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).send('The item with the given ID was not found.');

    res.send(item);
});

router.get('/sampleno/:id', [auth], async (req, res) => {
    const item = await Item.find({sampleNo: req.params.id});

    if (!item) return res.status(404).send('The item with the given sample was not found.');

    res.send(item);
});
module.exports = router;
