/* Express Router for development pages to test LTI
04.28.2018 tps Created.
05.04.2018 tps Display results of live query of CAM student list.
05.25.2018 tps Modify to reflect redirect logic changes.
*/

const express = require('express');
const router = express.Router();
const csvUtils = require('../../libs/csvUtils');
const utils = require('../../libs/utils');

/******************** Endpoint Handlers ********************/

/**
 * Handler for lookup endpoint.
 * Show user all the configuration data we have for the lookup.
 */
function lookupHandler(req, res) {
  // See if we got a request to reload the mapping data
  if (req.query['action'] === 'load') {
    utils.loadLookupTables(req.app.locals, (err) => {
      if (err) res.send(err);
      return renderLookupPage(req, res);
    });
  } else {
    return renderLookupPage(req, res);
  }
}


/******************** Helper Functions ********************/

function renderLookupPage(req, res) {
  const params = {
    assignments:  req.app.locals.map_ass2group,
    terms:        req.app.locals.map_term2dest,
    camUrl:       process.env.CAM_USER_SEARCH_URL,
    defaultDest:  process.env.DEFAULT_DESTINATION,
    timestamp:    req.app.locals.load_timestamp
  };
  return res.render('dev/lookup', params);

    // csvUtils.parseUrl(process.env.CAM_STUDENT_LIST_URL, (err, studentList) => {
  //   if (err) return res.send('Error querying CAM student list: ' + err);
  //   const params = {
  //     assignments:  req.app.locals.map_ass2group,
  //     terms:        req.app.locals.map_term2dest,
  //     students:     studentList,
  //     camUrl:       process.env.CAM_STUDENT_LIST_URL,
  //     defaultDest:  process.env.DEFAULT_DESTINATION,
  //     timestamp:    req.app.locals.load_timestamp
  //   };
  //   return res.render('dev/lookup', params);
  // });
}

  
/******************** Endpoint Routing ********************/
router.get('/lookup',           lookupHandler);

/******************** Exports ********************/
exports.router = router;