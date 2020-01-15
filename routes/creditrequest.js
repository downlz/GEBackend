// Needs to completely done few requests are pending
const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {User} = require('../models/user');
const {State} = require('../models/state');
const {City} = require('../models/city');
const {CreditRequest,validate} = require('../models/creditrequest');
const {dropIfDNE} = require('./orders');
const sendEmail = require('../middleware/sendemail');

// const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', [auth,permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  const creditrequest = await CreditRequest.find();
  res.send(creditrequest);
});

router.post('/', [auth], async (req, res) => {
  lastturnoverdtl = 'Not provided';
  // try {
  const { error } = validate(req.body);
  console.log(error)
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.user);
  if (!user) return res.status(400).send('Invalid user.');

  let creditrequestObj = _.pick(req.body, ['name','city','state','pin','user','annualturnover','lastthreeturnovr','tradeitems','phone','status','remarks']);
  dropIfDNE(creditrequestObj, ['name','city','state','pin','user','annualturnover','lastthreeturnovr','tradeitems','phone','status','remarks']);
  
  creditrequestObj.requestedon = Date();

  let creditrequest = new CreditRequest(creditrequestObj);
  creditrequest = await creditrequest.save();
  if (creditrequestObj.lastthreeturnovr) {
    lastturnoverdtl = creditrequestObj.lastthreeturnovr
  }
  var message = `<p>Dear User,</p>
        <p>Thank you for showing your interest in availing credit services from Graineasy.<br>

        We have received your request successfully.We will perform eligibility check based on details shared with us with our partnering banks.
        This process is going to take some time and we will connect with you for additional information if required to proceed with your application.
        Please feel free to reach out to us on trade@graineasy.com to know more about credit service offered by Graineasy.
        <br>
        ` + 'Current Year Annual Turnover: Rs.' + creditrequestObj.annualturnover + 
        '<br>Last 3 yrs average turnover: Rs.' + lastturnoverdtl  +
        '<br>Trade Items: ' + creditrequestObj.tradeitems +
        `
        <br><br>
        Regards,<br>
        Graineasy <br>
        Ph: +91 83404 45819
        </p>`
  var emailsubject = 'Credit Request Received'

  sendEmail(user.email, process.env.EMAILCCUSER, process.env.EMAILBCCUSER,emailsubject, message);
  res.send(creditrequest);
  // } catch (e) {
  //   return res.status(500).send(e.message);
  // }
});

router.put('/:id', [auth,permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  let creditrequestObj = _.pick(req.body, ['city','state','pin','user','annualturnover','lastthreeturnovr','tradeitems','phone','status','remarks']);
  dropIfDNE(creditrequestObj, ['city','state','pin','user','annualturnover','lastthreeturnovr','tradeitems','phone','status','remarks']);
  
  creditrequestObj.lastupdated = Date();

  const creditrequest = await CreditRequest.findByIdAndUpdate(req.params.id, creditrequestObj, {
    new: true
  });

  if (!creditrequest) return res.status(404).send('The genre with the given ID was not found.');

  res.send(creditrequest);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const creditrequest = await CreditRequest.findByIdAndRemove(req.params.id);

  if (!creditrequest) return res.status(404).send('The genre with the given ID was not found.');

  res.send(creditrequest);
});

router.get('/:id',[auth, permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  const creditrequest = await CreditRequest.findById(req.params.id);

  if (!creditrequest) return res.status(404).send('The genre with the given ID was not found.');

  res.send(creditrequest);
});

router.get('/user/:id',[auth, permit('admin','buyer','seller','agent','transporter')], async (req, res) => {
  const creditrequest = await CreditRequest.find({'user':req.params.id});

  if (!creditrequest) return res.status(404).send('The genre with the given ID was not found.');

  res.send(creditrequest);
});

module.exports = router;
