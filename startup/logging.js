// const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

const {createLogger,format,transports} = require('winston');

// module.exports = createLogger({
//   transports: [
//     new transports.Console({
//       level: 'debug'
//     })
//   ]
// });

// const logger = createLogger({
//   format: combine(
//     label({ label: 'right meow!' }),
//     timestamp(),
//     prettyPrint()
//   ),
//   transports: [new transports.Console()]
// })

// logger.log({
//   level: 'info',
//   message: 'What time is the testing at?'
// });
