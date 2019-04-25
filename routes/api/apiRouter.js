/* Express Router for AJAX endpoints
04.28.2018 tps Created.
05.04.2018 tps Destination lookup happens async.
05.04.2018 tps Add endpoint for testing lookup starting with term code.
*/

const express = require('express');
const router = express.Router();
const utils = require('../../libs/utils');
// const csvUtils = require('../../libs/csvUtils');

/******************** Endpoint Handlers *********************/

/* Handle restful query lookup test.
Returns JSON with error or result object.
*/
function lookupHandler(req, res) {
  // Extract parameters from endpoint URL
  const email = req.params.email;
  const assignment = req.params.assignment;

  utils.resolveDestinationByEmail(req.app.locals, email, assignment, (err, destination) => {
    if (err) return res.json( { err: err } );
    return res.json( { result: destination } );
  });

  // utils.resolveDestinationAsync(req.app.locals, email, assignment, (err, destination) => {
  //   if (err) return res.json( { err: err } );
  //   return res.json( { result: destination } );
  // });
  // try {
  //   const destinationUrl = utils.resolveDestUsingLocals(req.app.locals, email, assignment);
  //   return res.json( { result: destinationUrl });  
  // } catch (err) {
  //   return res.json( {err: err} );
  // }
}

/**
 * Handle restful query for lookup by term code.
 * Returns JSON with error or result object.
*/
function lookupByTermCodeHandler(req, res) {
  // Extract parameters from endpoint URL
  const termCode = req.params.termCode;
  const assignment = req.params.assignment;
  try {
    const destination = utils.resolveDestinationByTermCode(req.app.locals, termCode, assignment);
    return res.json( { result: destination } );
  } catch (err) {
    return res.json( { err: err } );
  }
}

function lookupCamUserHandler(req, res) {
  const email = req.params.email;
  utils.lookupCamUser(email, (err, userData) => {
    if (err) return res.json({err:err});
    return res.json(userData);
  });

}


/******************** Endpoint URLs *********************/
router.get('/lookup/email/:email/assignment/:assignment', lookupHandler);
router.get('/lookup/term/:termCode/assignment/:assignment', lookupByTermCodeHandler);
router.get('/lookup/camuser/:email', lookupCamUserHandler);

exports.router = router;
