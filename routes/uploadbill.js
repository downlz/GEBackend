const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
// const aadhar = require('../models/test');
const {Order} = require('../models/order');
// const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
// const bodyParser = require('body-parser');
const path = require('path');
const _ = require('lodash');
const multer = require('multer');
const request = require('request');
var fs = require('fs');
const http = require('http');

// const googleStorage = require('@google-cloud/storage');

// var config = {
//   projectId: "graineasy-242610",
//   keyFilename: "graineasy-242610-df55e5318166.json"
// };

// var storage = require('@google-cloud/storage')(config);
// const bucket = storage.bucket("gs://graineasy-242610.appspot.com/");

// SET STORAGE
// https://medium.com/@stardusteric/nodejs-with-firebase-storage-c6ddcf131ceb Using Firebase

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now())
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})
 
var upload = multer({ storage: storage })

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024                             // no larger than 5mb
//   }
// });

router.post('/', [auth,upload.single('myFile')], async (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  console.log(req.body);

  orderObj = {
    filename: file.filename,
    addedOn: Date.now()
  }
  // Posting image to firebase https://www.youtube.com/watch?v=YkvqLNcJz3Y
  // console.log(orderObj);
  const order = await Order.updateOne({_id : req.body.orderId}, {$set: {'manualbill': orderObj}});
  console.log(order);
  if (!order) 
    return res.status(404).send('Unable to upload bill for requested order');
  else 
    res.send(file)
});

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order != null) {
    var file = order.manualbill.filename;
    var fileLocation = path.join('./uploads',file);
    res.download(fileLocation, file); 
  } else {
    return res.status(404).send('Unable to find active bill associated with order');
  }
});

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);
  const sendReq = request.get(url);

  // verify response code
  sendReq.on('response', (response) => {
      if (response.statusCode !== 200) {
          return cb('Response status was ' + response.statusCode);
      }

      sendReq.pipe(file);
  });

  // close() is async, call cb after close completes
  file.on('finish', () => file.close(cb));

  // check for request errors
  sendReq.on('error', (err) => {
      fs.unlink(dest);
      return cb(err.message);
  });

  file.on('error', (err) => { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      return cb(err.message);
  });
};

module.exports = router;
