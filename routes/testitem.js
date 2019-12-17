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
// const http = require('http');
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
// const bodyParser = require('body-parser');

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

// const app = express()
// router.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }))
router.use(session({
  secret: process.env.SECRET_COOKIE || 'anything-you-want-but-keep-secret',
  resave: true,
  saveUninitialized: true
}));

router.use(bodyParser.urlencoded({
  extended: false
}));

router.post('/', async (req, res) => {

  // const encPassword = crypt.encrypt('randomtext');
  // console.log(encPassword);
  // console.log(crypt.decrypt(encPassword));
  // console.log(crypt.decrypt(''));
  // send mail with defined transport object

  // sendEmail('shahnawaz_haq@outlook.com', 'Order Placed', 'Test message');  // can be a await call
  // console.log(info);
  // console.log("Message sent: %s", info.messageId);  
  
  res.send({
    message: 'Hello'
  })

});

router.get('/banner', async (req, res) => {

  var msg = {
    'banner1' : 'https://res.cloudinary.com/dkhlc6xlj/image/upload/v1555253437/qpdbvi2vhlrged6ymemq.png',
    'banner2' : 'https://res.cloudinary.com/dkhlc6xlj/image/upload/v1576426887/hvr1omhtkpgvxcn8v8my.jpg',
    'banner3' : 'https://res.cloudinary.com/dkhlc6xlj/image/upload/v1567519756/zzfrugh6ji0xta71jncm.jpg',
  }
  res.send({
    msg
  });

});

router.post('/receivewhatsapp', (req, res) => {
  
  const smsCount = req.session.counter || 0;

  let message = 'Hello, thanks for the new message.';

  if (smsCount > 0) {
    message = 'Hello, thanks for message number ' + (smsCount + 1);
  }

  req.session.counter = smsCount + 1;

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  res.end(twiml.toString());

  // const twiml = new MessagingResponse();
  // const message = twiml.message();

  // if (req.body.Body == 'hello') {
  //   twiml.message('Hi!');
  // } else if (req.body.Body == 'bye') {
  //   twiml.message('Goodbye');
  // } else {
  //   // twiml.message(
  //   //   'No Body param match,' + req.body.Body + 'Twilio sends this in the request to your server.'
  //   // );
  //   message.body('Store Location: 123 Easy St.');
  //   message.media('https://demo.twilio.com/owl.png');
  // }

  // res.writeHead(200, {
  //   'Content-Type': 'text/xml'
  // });
  // res.end(twiml.toString());
});

router.post('/cbwhatsapp', async (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

router.post('/sendwhatsapp', async (req, res) => {

   const accountSid = 'ACeca183e1cc9f3f9f5ac242f9a0c27ecf';
   const authToken = process.env.TWILIOAUTH;
   const client = require('twilio')(accountSid, authToken);

   client.messages
     .create({
       from: 'whatsapp:+14155238886',
       body: req.body.text,
      //  mediaUrl: 'https://demo.twilio.com/owl.png',
       statusCallback: 'https://f17c23e5.ngrok.io/api/testitem/cbwhatsapp',
       to: 'whatsapp:+918297855195'
     })
     .then(message => console.log(message));
    
     res.sendStatus(200)
    // res.send({
    //   message: 'Message sent successfully'
    // })

  });

module.exports = router;
