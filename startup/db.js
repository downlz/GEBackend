// const logger = require('./logger');
const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {
  mongoose.connect(process.env.DBCONN,{ useNewUrlParser: true })
    .then(() => winston.info('Connected to MongoDB...'));
  mongoose.set('useCreateIndex', true);  
  mongoose.set('useFindAndModify', false);
}
