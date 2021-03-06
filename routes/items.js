const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Item, validate} = require('../models/item');
const {Category} = require('../models/category');
const {ItemName} = require('../models/itemname');
const {City} = require('../models/city');
const {User} = require('../models/user');
const {Unit} = require('../models/unit');
const {Order} = require('../models/order');
const {Manufacturer} = require('../models/manufacturer');
const {Address, validateAddress} = require('../models/address');
const getRec = require('../middleware/functions');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const _ = require('lodash');

function dropIfDNE(Obj, arr) {
    for (var i = 0, size = arr.length; i < size; i++) {
        if (!Obj[arr[i]]) delete Obj[arr[i]];
    }
}

router.get('/', async (req, res) => {
  // Lists only active items
  const itemnameId = req.query.name;
  const catId = req.query.cat;
  const cityId = req.query.origin;
  const grade = req.query.grade;
  const price = req.query.price;
  const mnfId = req.query.mnf;

  const [recordtoskip,rowslimit] = getRec(req.query.pageid,req.query.pageSize)

  filter = {};
  if (itemnameId) {
    filter['name._id'] = itemnameId;
  }
  if (catId) {
    filter['category._id'] = catId;
  }
  if (cityId) {
    filter['city._id'] = cityId;
  }
  if (grade) {
    filter['grade'] = grade;
  }
  if (mnfId) {
    filter['manufacturer._id'] = mnfId;
  }
  if (price == 'asc') {
    const item = await Item.find({ $and :[filter,{'isLive': true}]}).sort('price').skip(recordtoskip).limit(rowslimit);
    res.send(item);
  }
  else if (price == 'desc'){
    const item = await Item.find({ $and :[filter,{'isLive': true}]}).sort({'price':-1}).skip(recordtoskip).limit(rowslimit);
    res.send(item);
  } else {
    const item = await Item.find({ $and :[filter,{'isLive': true}]}).sort({'updatedon':-1}).skip(recordtoskip).limit(rowslimit);
    res.send(item);
  }
  // console.log(item);
});

/**
 * Api to get listings by category id
 */
router.get('/byCategory/:category', async (req, res) => {
  const [recordtoskip,rowslimit] = getRec(req.query.pageid,req.query.pageSize)

    const state = await Item.find({
        $and : [{'category._id': req.params.category},
        {'isLive': true}]
    }).sort('name.name').skip(recordtoskip).limit(rowslimit);
    res.send(state);
});

/**
 * Api to get listings by itemname
 */
router.get('/byItemname/:itemname', async (req, res) => {
  const [recordtoskip,rowslimit] = getRec(req.query.pageid,req.query.pageSize)

  const state = await Item.find({
      $and : [{'name._id': req.params.itemname},
      {'isLive': true}]
  }).sort('name.name').skip(recordtoskip).limit(rowslimit);
  res.send(state);
});


/**
 * Api to get current  user listings
 */
router.get('/current', [auth], async (req, res) => {
    const [recordtoskip,rowslimit] = getRec(req.query.pageid,req.query.pageSize)
    
    const total = await Item.find({ $or : [{'seller._id': req.user._id},{'addedby._id': req.user._id}]
                  }).countDocuments(); 
    
    const item = await Item.find({ $or : [{'seller._id': req.user._id},{'addedby._id': req.user._id}]
    }).sort('name.name').skip(recordtoskip).limit(rowslimit);
    output = {
      totalRecords : total,
      pageId : req.query.pageid,
      pageSize : rowslimit,
      _embedded : {items : item}
    }
    res.send(output);
});

/**
 * Api to get all listings
 */
router.get('/all', [auth,permit('seller', 'admin', 'agent','buyer')], async (req, res) => {


  const [recordtoskip,rowslimit] = getRec(req.query.pageid,req.query.pageSize)

  const total = await Item.countDocuments(); // Removing await as this is super fast usually 
  const item = await Item.find({}).sort('sampleNo').skip(recordtoskip).limit(rowslimit);

  output = {
    totalRecords : total,
    pageId : req.query.pageid,
    pageSize : rowslimit,
    _embedded : {items : item}
  }
  res.send(output);
});

/**
 *  Api to get newly added items
 */

router.get('/recent', async (req, res) => {
  const recentitem = await Item.find({}).sort({'updatedon': -1}).limit(6);
  res.send(recentitem);
});

router.get('/ordered', async (req, res) => {
  const recentlyordered = await Order.find({},{item:1}).sort({'placedTime': -1}).limit(6);
  // const recentlyordered = await Order.distinct('item').sort({'placedTime': -1}).limit(4);
  // const recentlyordered = await Order.aggregate( [ { $project : { 'item': 0 } } ] ).sort({'placedTime': -1}).limit(4);
  res.send(recentlyordered);
});

/*
* Api to select nearby items
*/

router.post('/nearme',[auth], async (req, res) => {
  // Ideally should be done based on user location 
  nearbyCities = [];
  const user = await User.findById(req.user._id).select('-password');

  getsourcePoint = process.env.GEAPILOCALSERVER + '/api/city/createfixcluster/source?source='+user.Addresses[0].city.name;
  sourcePoints =  await axios.get(getsourcePoint)
  sourcePoints.data.forEach(function(point) {
    nearbyCities.push(point._id)
    });
  
  const item = await Item.find({ $and : [
      {'city._id': {$in :nearbyCities}},
      {'isLive' : true}]                   //Search for only active item.
    }).sort({'updatedon': -1}).limit(8);

  res.send(item);
});

router.post('/', [auth, permit('seller', 'admin', 'agent')], async (req, res) => {
  
    let itemObj = _.pick(req.body, ['image',
        'qty', 'price', 'moisture', 'grainCount', 'grade', 'sampleNo', 'origin', 'isLive', 'isTaxable', 'specs','remarks','paymentdate','liftdate']);
    dropIfDNE(itemObj, ['image', 'qty', 'price', 'moisture', 'graincount', 'grade', 'sampleNo', 'origin', 'isLive', 'isTaxable','specs','remarks','paymentdate','liftdate']);
   
  // const { error } = validate(req.body);        // Disabled on 15-Mar-20 upon payment and lift date addition
  // console.log(error);
  // if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send('Invalid customer.');

    const name = await ItemName.findById(req.body.nameId);
    if (!name) return res.status(400).send('Invalid category.');

    getItemName = name.name.toUpperCase()

    const city = await City.findById(req.body.cityId);
    if (!city) return res.status(400).send('Invalid city.');

    const address = await Address.findById(req.body.addressId);
    if (!address) return res.status(400).send('Invalid address');

    const seller = await User.findById(req.body.sellerId);
    if (!seller) return res.status(400).send('Invalid seller');

    const unit = await Unit.findById(req.body.unitId);
    if (!unit) return res.status(400).send('Invalid unit.');

    const user = await User.findById(req.body.addedby);
    if (!user) return res.status(400).send('Invalid User');

    const manufacturer = await Manufacturer.findById(req.body.manufacturerId);
    if (!manufacturer) return res.status(400).send('Invalid Manufacturer');

    if (!req.body.sampleNo) {
      var search = getItemName.substring(0, 3);
      const itemlist = await Item.find({'sampleNo': new RegExp(search)}).sort({sampleNo: -1}).collation({locale: "en_US", numericOrdering: true}).limit(1)
      if (!itemlist) return res.status(404).send('The item with the given ID was not found.');
      if (typeof itemlist !== 'undefined' && itemlist.length > 0){
        autoGeneratedSNo = parseInt(itemlist[0].sampleNo.slice(3)) + 1
      } else {
        autoGeneratedSNo = 1000                                     //Start with 1000
      }
      itemObj.sampleNo = search + autoGeneratedSNo
    }  

    itemObj.category = category;
    itemObj.name = name;
    itemObj.city = city;
    itemObj.address = address;
    itemObj.seller = seller;
    itemObj.unit = unit;
    itemObj.manufacturer = manufacturer;
    itemObj.addedby = user;
    itemObj.updatedon = Date();

  let item = new Item(itemObj);
  item = await item.save();

    res.send(item);
});

router.put('/activate/:id', [auth], async (req, res) => {
  // const item = await Item.findById(req.params.id);

  itemObj = { 'isLive' : true,'updatedon' : Date()}
  itemupd = await Item.findByIdAndUpdate(req.params.id, itemObj, {
    new: true
  });

  if (!itemupd) return res.status(404).send('Issue with updating the document');

  res.send(itemupd);
});

router.put('/:id', [auth], async (req, res) => {
    // const {error} = validate(req.body);
    // console.log(req.body);
    // if (error) return res.status(400).send(error.details[0].message);
    
    let itemObj = _.pick(req.body, ['image',
        'qty', 'price', 'moisture', 'grainCount', 'grade', 'sampleNo', 'origin', 'isLive', 'isTaxable', 'specs','bargainenabled','bargaintrgqty','remarks','paymentdate','liftdate']);
    dropIfDNE(itemObj, ['image', 'qty', 'price', 'moisture', 'graincount', 'grade', 'sampleNo', 'origin', 'isLive', 'isTaxable','specs','bargainenabled','bargaintrgqty','remarks','paymentdate','liftdate']);

    // const category = await Category.findOne({name: req.body.categoryId});
    // if (!category) return res.status(400).send('Invalid customer.');

    // const name = await ItemName.findById(req.body.nameId);
    // if (!name) return res.status(400).send('Invalid category.');

    // const city = await City.findById(req.body.cityId);
    // if (!city) return res.status(400).send('Invalid city.');

    // const address = await Address.findById(req.body.addressId);
    // if (!address) return res.status(400).send('Invalid address');

    // const seller = await User.findById(req.body.sellerId);
    // if (!seller) return res.status(400).send('Invalid seller');

    const unit = await Unit.findById(req.body.unitId);
    if (!unit) return res.status(400).send('Invalid unit.');

    // itemObj = _.pick(req.body, ['name', 'image',
    //     'qty', 'price', 'moisture', 'grainCount', 'grade', 'sampleNo', 'origin', 'isLive', 'isTaxable']);

    // itemObj.category = category;
    // itemObj.name = name;
    // itemObj.city = city;
    // itemObj.address = address;
    // itemObj.seller = seller;
    itemObj.unit = unit;
    itemObj.updatedon = Date();

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

router.get('/grade/:grade', [auth], async (req, res) => {
  // console.log('printing data');
  const item = await Item.find({grade: req.params.grade});

  if (!item) return res.status(404).send('items with the given grade were not found.');

  res.send(item);
});

router.get('/search/:text', [auth], async (req, res) => {         // Improve Search technique

  const [recordtoskip,rowslimit] = getRec(req.query.pageid,req.query.pageSize)
  searchtext=req.params.text;
  const item = await Item.find({
    $or :
          [{sampleNo: {
            $regex: new RegExp(searchtext),
            $options: 'i'
          }},
          {origin: {
            $regex: new RegExp(searchtext),
            $options: 'i'
          }},
          {'manufacturer.name': {
            $regex: new RegExp(searchtext),
            $options: 'i'
          }},
          {'category.name': {
            $regex: new RegExp(searchtext),
            $options: 'i'
          }},
          {'name.name': {
            $regex: new RegExp(searchtext),
            $options: 'i'
          }},
          {'seller.name': {
            $regex: new RegExp(searchtext),
            $options: 'i'
          }}]
        }).sort('sampleNo') //.skip(recordtoskip).limit(rowslimit);

// Junk Code for testing
  //   sampleNo : 
  //   {
  //     $regex: new RegExp(searchtext),
  //     $options: 'i'
  //   }
  // },{
  //     _id : 0,
  //     __v:0
  //   }
  // )
//     // $match: {

//     //   sampleNo: {
      
//     //   $regex: req.params.text,
      
//     //   '$options': 'i'
//     //   }
//     // }
//     // $or :
//     // [{'sampleNo': '/' + req.params.text.toUpperCase() + '/'},
//     //   {'origin': '/' + req.params.text + '/'},
//     //   {'manufacturer.name': '/' + req.params.text + '/'},
//     //   {'category.name': '/' + req.params.text + '/'},
//     //   {'name.name': '/' + req.params.text + '/'}]
//     // $match: {
//     //   $or: [
//     //   { sampleNo: {
//     //   $regex: req.params.text,
//     //   $options: 'i'
//     //   }},
//     //   { origin: {
//     //   $regex: req.params.text,
//     //   $options: 'i'
//     //   }}
//     //   ]
//     //   }
//     });

//   // const item = await Item.find({
//   //   "$text": {
//   //           "$search": req.params.text
//   //   }
//   // });
output = {
  totalRecords : item.length,
  _embedded : {items : item}
}
  if (!item) return res.status(404).send('The item with the given sample was not found.');

  res.send(output);
});

module.exports = router;