const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {BankAccount, validate} = require('../models/bankaccount');
const {User} = require('../models/user'); 
const {dropIfDNE} = require('./orders');
const express = require('express');
const _ = require('lodash');
const router = express.Router();

router.get('/',[auth], async (req, res) => {
  const bankacc = await BankAccount.find().sort('user');
  res.send(bankacc);
});

router.post('/', [auth], async (req, res) => {
  const { error } = validate(req.body); 
  console.log(error);
  if (error) return res.status(400).send(error.details[0].message);
  
  const user = await User.findById(req.body.user);
  if (!user) return res.status(400).send('Invalid user.');

  let bankAccountObj = _.pick(req.body, ['accountType','accountNo','bank','name','micr','ifsc','accountPreference'
                        ,'approved','remarks','createdBy','updatedAt']);

  dropIfDNE(bankAccountObj, ['accountType','accountNo','micr','ifsc','accountPreference'
  ,'approved','remarks','createdBy','updatedAt']);

  bankAccountObj.user = user
  bankAccountObj.createdAt = Date.now()
  
  let bankaccount = new BankAccount(bankAccountObj);
  bankaccount = await bankaccount.save();
  
  res.send(bankaccount);
});

router.put('/:id', [auth, permit('admin')], async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const bankacc = await BankAccount.findByIdAndUpdate(req.params.id, { accountNo: req.body.accountNo,
                  micr: req.body.micr,
                  ifsc: req.body.ifsc,
                  name: req.body.name,
                  bank: req.body.bank,
                  accountPreference: req.body.accountPreference,
                  remarks: req.body.remarks,
                  updatedAt: Date.now()
                }, {
    new: true
  });

  if (!bankacc) return res.status(404).send('The bank account with the given ID was not found.');
  
  res.send(bankacc);
});

router.delete('/:id', [auth, permit('admin')], async (req, res) => {
  const bankacc = await BankAccount.findByIdAndRemove(req.params.id);

  if (!bankacc) return res.status(404).send('The bank account with the given ID was not found.');

  res.send(bankacc);
});

router.get('/:id', async (req, res) => {
  const bankacc = await BankAccount.findById(req.params.id);

  if (!bankacc) return res.status(404).send('The bankaccount with the given ID was not found.');

  res.send(bankacc);
});

module.exports = router;