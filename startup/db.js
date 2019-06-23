const logger = require('./logger');
const mongoose = require('mongoose');

module.exports = function() {
  mongoose.connect(process.env.DBCONN,{ useNewUrlParser: true })
    .then(() => logger.info('Connected to MongoDB...'));
  mongoose.set('useCreateIndex', true);  
  mongoose.set('useFindAndModify', false);
}
