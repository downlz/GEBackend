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

  console.log(req.body)
  res.send({
    message: 'Hello'
  })

});

module.exports = router;
