const auth = require('../middleware/auth');
const permit = require('../middleware/permissions');
const {Factor,validateFactor} = require('../models/pricemodel/factor'); 
const {FactorMapper,validateFactorMapper} = require('../models/pricemodel/factormapper'); 
const {UserFactor,validateUserFactorMapper} = require('../models/pricemodel/userfactor'); 
const {User} = require('../models/user'); 
const {Item} = require('../models/item'); 
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.post('/factor', [auth],  async (req, res) => {

  try {
    const {error} = validateFactor(req.body);
    console.log(error)
    if (error) return res.status(400).send(error.details[0].message);
    
    const user = await User.findById(req.body.addedby);
    if (!user) return res.status(400).send('Invalid User');
   
    let factor = new Factor({
        ...req.body
    });

    factor.addedby = req.user._id;
    factor.addedon = new Date();
    await factor.save();
    return res.status(200).send(factor);
  } catch (e) {
      return res.status(400).send(e.message);
  }

});

router.post('/mapfactor', [auth],  async (req, res) => {
  invalidfactors = []
  validfactorsStat = []
  validfactorsTrans = []
  try {
    // const {error} = validateFactorMapper(req.body);
    // console.log(error)
    // if (error) return res.status(400).send(error.details[0].message);
    
    const user = await User.findById(req.body.addedby);
    if (!user) return res.status(400).send('Invalid User');

    // Check request body for factor type
      
    // for ( var property in req.body  ) {
    //   if (property == 'static') {
          // Loop through static property items and verify them in factor setup
          // if (req.body[property]) {
            for (const value of req.body['static']){
            const sfactor = await Factor.find({$and :[{'name':value},{'type':'static'}]},{_id:1});
            
            if (typeof sfactor !== 'undefined' && sfactor.length > 0){
              validfactorsStat.push(value);  
              } else {
                invalidfactors.push(value)
              }
          };
        // }
      // } 
      // else if (property == 'transactional') {
        // Loop through static property items and verify them in factor setup
        // if (req.body[property]) {
          for (const value of req.body['transactional']){
          const tfactor = await Factor.find({$and :[{'name':value},{'type':'transactional'}]},{_id:1});
          if (typeof tfactor !== 'undefined' && tfactor.length > 0){
            validfactorsTrans.push(value);  
            } else {
              invalidfactors.push(value)
            }
        };
      // }
  // }

  resultsObj = {'static':validfactorsStat,
                'transactional':validfactorsTrans
              }
  
    let factor = new FactorMapper();
    factor.mapping = resultsObj;
    factor.addedby = req.user._id;
    factor.addedon = new Date();
    await factor.save();
    res.send({
      factor,
      'invalidfactors' : invalidfactors
    });
  } catch (e) {
      return res.status(400).send(e.message);
  }

});

router.post('/userfactor', [auth,permit('admin')],  async (req, res) => {

  try {
    const user = await User.findById(req.body.user);
    if (!user) return res.status(400).send('Invalid user group');

    const factormapper = await FactorMapper.findById(req.body.factormapper);
    if (!factormapper) return res.status(400).send('Invalid factor mapper');


    let factor = new UserFactor({
      ...req.body
    });

    factor.addedby = req.user._id;
    factor.addedon = new Date();
    // const {error} = validateUserFactorMapper(factor);
    // console.log(error)
    await factor.save();
    res.send({
      factor
    });

  } catch (e) {
    return res.status(400).send(e.message);
  }

});

router.get('/userfactor/calcprice/:userid/item/:itemid', [auth],  async (req, res) => {

    const user = await User.findById(req.params.userid);
    if (!user) return res.status(400).send('Invalid user id');

    const item = await Item.findById(req.params.itemid);
    if (!item) return res.status(400).send('Invalid factor mapper');

    const discfactor = await UserFactor.find({user:user.id});
    if (!discfactor) return res.status(400).send('Invalid factor mapper');

    // console.log(discfactor[0].factorvalue.static.sampleNo[0])

    
    sampleno = discfactor[0].factorvalue.static.sampleNo
    for (var property in sampleno ) {
      var keys = Object.keys(sampleno[property]);
      // console.log(keys[0])
      // console.log(keys[property]);
      // console.log(sampleno[property]);
      // console.log(item.sampleNo + ' ' + sample) 
      if (item.sampleNo == keys[0]){
          val = sampleno[property][keys[0]]
          isAbsolute = sampleno[property][keys[1]]
          price = isAbsolute ? item.price*(1 - val/100) : item.price - val
      }
    }
    
    res.send({
      'price' : price 
    });

});



router.get('/mapfactor', [auth],  async (req, res) => {
  const factormapper = await FactorMapper.find();
    if (!factormapper) return res.status(400).send('Invalid factor mapper');
    res.send(factormapper);
});

router.post('/test', [auth],  async (req, res) => {
  // console.log(req.body['static'])
  out=[]
  dim=[]
out,dim = await processFactors(req.body,'transactional')
// validfactorsTrans = []
// // req.body.transactional.forEach(async function(value) {
//   for (const value of req.body.transactional){
//   const tfactor = await Factor.find({$and :[{'name':value},{'type':'transactional'}]});
//     if (!tfactor) {
//       invalidfactors.push(value)
//     } else validfactorsTrans.push(value);
// };
console.log(out)
console.log(dim)
res.send(out);
});

async function processFactors(body,type) {
  validfactorsTrans = []
  invalidfactors = []
  for (const value of body[type]){
    const tfactor = await Factor.find({$and :[{'name':value},{'type':type}]});
      if (!tfactor) {
        invalidfactors.push(value)
      } else validfactorsTrans.push(value);
  };
  mapping = {validfactorsTrans,invalidfactors}
  return validfactorsTrans,invalidfactors;
}

module.exports = router;
