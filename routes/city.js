const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {City, validate} = require('../models/city');
const {State} = require('../models/state'); 
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const {toLatLon, toLatitudeLongitude, headingDistanceTo, moveTo, insidePolygon,insideCircle} = require('geolocation-utils');

router.get('/', async (req, res) => {
  const city = await City.find().sort('name');
  res.send(city);
});

router.post('/', [auth], async (req, res) => {
  // const { error } = validate(req.body); 
  // console.log(error);
  // if (error) return res.status(400).send(error.details[0].message);
  
  
  const state = await State.findById(req.body.stateId);
  if (!state) return res.status(400).send('Invalid state.');

  let cityObj = _.pick(req.body, ['name']);

  locationObj = {
    type : req.body.type,
    coordinates : [req.body.lat,req.body.lng]
  }

  cityObj.state = state;
  cityObj.loadingPerKg = 0;
  cityObj.unloadingPerKg = 0;
  cityObj.packagingPerKg = 0;
  cityObj.location = locationObj;
  
  let city = new City(cityObj);
  city = await city.save();
  
  res.send(city);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const city = await City.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
    new: true
  });

  if (!city) return res.status(404).send('The genre with the given ID was not found.');
  
  res.send(city);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const city = await City.findByIdAndRemove(req.params.id);

  if (!city) return res.status(404).send('The genre with the given ID was not found.');

  res.send(city);
});

router.get('/:id', async (req, res) => {
  const city = await City.findById(req.params.id);

  if (!city) return res.status(404).send('The genre with the given ID was not found.');

  res.send(city);
});

router.get('/createfixcluster/source', async (req, res) => {

  validSource =[]
  const city = await City.find({'name':req.query.source});

  const center = {lat: city[0].location.coordinates[0], lon: city[0].location.coordinates[1]}
  radius = 200000                                                   // 200 km make it dynamic

  const cityAll = await City.find({'location.coordinates':{$ne:null}});
  if (!cityAll) return res.status(400).send('No nearby by cities found');

  cityAll.forEach(function(point) {
    var pointName = point.name;
    result = insideCircle({lat: point.location.coordinates[0], lon: point.location.coordinates[1]}, center, radius) // true
    if (result == true) {
      validSource.push(pointName)
    }
    });
  const selectedPoints = await City.find({'name':{$in :validSource}});
  
  res.send(selectedPoints);
  
});

module.exports = router;