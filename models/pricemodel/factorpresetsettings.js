// For Future use only
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

// const userFactorSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
//   },
//   factormapper : {
//     type: mongoose.Schema.Types.ObjectId, ref: 'FactorMapper', required: false
//   },
//   factorvalue : {
//     type: Object
//   },
//   allowreuse :{
//     type: Boolean,
//     default: false
//   },
//   active :{
//     type: Boolean,
//     default: true,
//   },
//   referuserfactor :{              // For future use in case a user factors is being planned to be cloned.Can cause problem if base user changes rather makes sense to explicitly mention factormappe id
//     type: String,                 // Can be a business case where user factors changes automatically based on user relationship hence thought of
//     default: null 
//   },
//   addedon: {
//       type: Date,
//       required: false
//   },
//   updatedon: {
//     type: Date,
//     required: false
//   },
//   addedby: {
//     type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
// },
// });

// const userfactor = mongoose.model('UserFactor', userFactorSchema);

// function validateFactorMapper(factormapper) {
//   const schema = {
//     user: Joi.objectId().required(),
//     factormapper: Joi.objectId(),
//     allowreuse: Joi.boolean().optional(),
//     active: Joi.boolean(),
//     referuserfactor: Joi.string().optional(),
//     addedon: Joi.date().optional(),
//     updatedon: Joi.date.optional(),
//     addedby: Joi.objectId().required(),
//   };

//   return Joi.validate(factormapper, schema);
// }

// exports.validateFactorMapper = validateFactorMapper;
// exports.FactorMapper = factormapper; 
// exports.validate = validateFactorMapper;