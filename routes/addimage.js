const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const aadhar = require('../models/test');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary')
const bodyParser = require('body-parser');
const path = require('path');
const _ = require('lodash');
// const cloudinary = require('../middleware/cloudinary');
require('../middleware/cloudinary');
const upload = require('../middleware/multer');
// const {Blog} = require('../models/blog');
//
// var multer  = require('multer');
// var storage = multer.memoryStorage();
// var upload = multer({ storage: storage });
// var stream = require('stream');

const app = express()
router.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }))

router.post('/',upload.single('image'), async (req, res) => {

  console.log(req.body)
  // res.send(req.body)
  // console.log(req.body.unifiedurl)
  // console.log(req.body.image)
  // res.send({message:'Failed'})
  // console.log(__dirname)
  // console.log(req.file)
  // const result = await cloudinary.v2.uploader.upload("https://res.cloudinary.com/dkhlc6xlj/image/upload/v1546366298/GrainEasy/items/tuar-dal-1363073.jpg")
  const result = await cloudinary.v2.uploader.upload(req.file.path)
  res.send({
    message: result.secure_url
  })

});

// router.post('/', upload.single('image'), function (req, res, next) {
//
//  var upload_stream = cloudinary.v2.uploader.upload_stream(function(err,image) {
//       res.send(image.secure_url);
// });
//
// var bufferStream = new stream.PassThrough();
// bufferStream.end(req.file.buffer);
// bufferStream.pipe(upload_stream);
// })

module.exports = router;
