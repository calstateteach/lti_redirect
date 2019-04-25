/* Test Web app that shows LTI POST parameters.
04.26.2018 tps Created.
*/

require('dotenv').config();
const async = require('async');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
// const csvUtils = require('./libs/csvUtils');
const utils = require('./libs/utils');

// Use pug template engine
app.set('view engine', 'pug');

// Use request body parsing module
app.use(bodyParser.urlencoded({extended: true}));

// Configure for use from behind a proxy.
app.set('trust proxy', true);
app.set('trust proxy', 'loopback');

// URL location of Web app. Use to build URL links when app is
// running under a reverse proxy server.
// e.g. "https://ourdomain.com/endpoint/"
app.locals.APP_URL = process.env.APP_URL;

// Configure routes
app.use('/lti', require('./routes/lti/ltiRouter').router);
app.use('/dev', require('./routes/dev/devRouter').router);
app.use('/api', require('./routes/api/apiRouter').router);

// Dummy endpoint so we can see if this is running.
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Pre-load the lookup table the LTI uses for its work.
utils.loadLookupTables(app.locals, (err) => {
  if (err) return console.log('Cannot start Web app:', err);
  return startWebApp();
});


function startWebApp() {
  app.listen(process.env.APP_PORT, function() {
    console.log('listening on', process.env.APP_PORT);
  })
};

