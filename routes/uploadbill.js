const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const aadhar = require('../models/test');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const _ = require('lodash');
const multer = require('multer');

// SET STORAGE
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

router.post('/', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
    res.send(file)
  
})

// const app = express()
// router.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }))



// router.post('/',upload.single('image'), async (req, res) => {

//   console.log(req.body)
//   // res.send(req.body)
//   // console.log(req.body.unifiedurl)
//   // console.log(req.body.image)
//   // res.send({message:'Failed'})
//   // console.log(__dirname)
//   // console.log(req.file)
//   // const result = await cloudinary.v2.uploader.upload("https://res.cloudinary.com/dkhlc6xlj/image/upload/v1546366298/GrainEasy/items/tuar-dal-1363073.jpg")
//   const result = await cloudinary.v2.uploader.upload(req.file.path)
//   res.send({
//     message: result.secure_url
//   })

// });

// // router.post('/', upload.single('image'), function (req, res, next) {
// //
// //  var upload_stream = cloudinary.v2.uploader.upload_stream(function(err,image) {
// //       res.send(image.secure_url);
// // });
// //
// // var bufferStream = new stream.PassThrough();
// // bufferStream.end(req.file.buffer);
// // bufferStream.pipe(upload_stream);
// // })

module.exports = router;
