const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
require('winston-mongodb');

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  // level: 'info',
  // defaultMeta: { service: 'user-service' },
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ 
                        maxsize : 5120000,
                        maxFiles : 4,
                        filename: `${__dirname}/../logs/error.log`, level: 'error' }),
    new transports.File({
                        maxsize : 5120000,
                        maxFiles : 4, 
                        filename: `${__dirname}/../logs/combined.log` }),
    new transports.Console({level: 'debug'})
    // new transports.MongoDB({
    //           name: 'db-log',
    //           db : 'mongodb://admin:{enterpasswordhere}@ds125331.mlab.com:25331/graineasy-log',
    //           // level : 'info',
    //           capped : true
    //       })
  ],
  exceptionHandlers: [
    new transports.File({ 
                        maxsize : 5120000,
                        maxFiles : 4,
                        filename: `${__dirname}/../logs/exceptions.log` })
  ]

});

process.on('unhandledRejection', (ex) => {
  logger.error(ex);
});

process.on('uncaughtException', (ex) => {
  logger.error(ex);
});

module.exports = logger;

// Logging level
// { 
//   emerg: 0, 
//   alert: 1, 
//   crit: 2, 
//   error: 3, 
//   warning: 4, 
//   notice: 5, 
//   info: 6, 
//   debug: 7
// }