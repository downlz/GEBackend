const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const aadhar = require('../models/test');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const crypt = require('../middleware/crypt.js');
// const nodemailer = require('nodemailer');
const sendEmail = require('../middleware/sendemail');
const bodyParser = require('body-parser');
const path = require('path');
const _ = require('lodash');
// const cloudinary = require('../middleware/cloudinary');
require('../middleware/cloudinary');
// require('../middleware/nodemailer');

// const upload = require('../middleware/multer');
// const {Blog} = require('../models/blog');
//
// var multer  = require('multer');
// var storage = multer.memoryStorage();
// var upload = multer({ storage: storage });
// var stream = require('stream');

const app = express()
// router.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }))

router.post('/', async (req, res) => {

  // const encPassword = crypt.encrypt('randomtext');
  // console.log(encPassword);
  // console.log(crypt.decrypt(encPassword));
  // console.log(crypt.decrypt(''));
  // send mail with defined transport object

  sendEmail('shahnawaz_haq@outlook.com', 'Order Placed', 'Test message');  // can be a await call
  // console.log(info);
  // console.log("Message sent: %s", info.messageId);  
  
  res.send({
    message: 'Hello'
  })

});

module.exports = router;
