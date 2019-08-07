// const logger = require('./startup/logger');
const winston = require('winston');
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const httpsOptions = {
    cert: fs.readFileSync(process.env.CERTIFICATEPATH,'utf8'),
    key: fs.readFileSync(process.env.KEYPATH,'utf8')
}

const port = process.env.PORT || 3000;
const port_https = process.env.PORTHTTPS || 3001;
http.createServer(app).listen(port, () => winston.info(`Listening on port ${port}...`));
https.createServer(httpsOptions, app).listen(port_https, () => winston.info(`Listening on https port ${port_https}...`));
