/* Express Router for LTI endpoint
04.27.2018 tps Created.
05.04.2018 tps Destination lookup function is async.
05.04.2018 tps Add special redirect routing based on user's first name.
05.24.2018 tps Add redirect path for CAM faculty users.
*/

const express = require('express');
const router = express.Router();
const isValidRequest = require('./oAuthLibs/oauthHelper').validateLtiRequest;
const utils = require('../../libs/utils');

/******************** Endpoint Handlers ********************/

/**
 * Handler for LTI endpoint.
 */
function endpointHandler(req, res) {

  // Extract stuff we're interested in from the POST.
  const refererQueryParams = utils.extractQueryParams(req.headers['referer']);
  // const userLogin = req.body['custom_canvas_user_loginid'];
  // const assignmentId = refererQueryParams['assignment'];

  // Secret path for debugging that shows us what is getting passed to the endpoint
  // https://ourdomain.instructure.com/accounts/1/external_tools/67839876483?display=borderless&assignment=abcxyz&route=showpost
  if (refererQueryParams['route'] === 'showpost') {
    postParamsHandler(req, res);    
  } else if (isValidRequest('POST', process.env.CST_LTI_LAUNCH_URL, req.body)) {
    // Special redirect handling for particular user first names
    var firstName = req.body['custom_person_name_given'];
    if (['Candidate', 'Teacher'].includes(firstName)) {
      termRedirectHandler(req, res, '989');
    } else {  // Normal redirect handling']
      redirectHandler(req, res);
    }
  } else {
    res.send('OAuth post not authenticated');
  }
}


/**
 * Handler for LTI endpoint that shows what got posted, for debugging.
 */
function postParamsHandler(req, res) {
  params = {
    originalUrl: req.originalUrl,
    body: req.body,
    reqHeaders: req.headers,
    query: req.query  // But POST request probably won't have query parameters
  };
  return res.render('lti/params', params);
}

/** 
 * Handler for LTI Post that redirects to result of destination lookup.
*/
function redirectHandler(req, res) {
  // Extract stuff we're interested in from the POST.
  const refererQueryParams = utils.extractQueryParams(req.headers['referer']);
  const userLogin = req.body['custom_canvas_user_loginid'];
  const assignmentId = refererQueryParams['assignment'];

  utils.resolveDestinationByEmail(req.app.locals, userLogin, assignmentId, (err, destinationUrl) => {
    if (err) return res.send(err);
    return res.redirect(destinationUrl);
  });

  // utils.lookupCamUser(userLogin, (err, camUser) => {
  //   if (err) return res.send(err);

  //   if (camUser.length < 1) return res.send('No CAM entry found for ' + userLogin);

  //   const userType = camUser[0].user_type;
  //   if (userType === 'Faculty') {
  //     // Faculty go to destination 1    
  //     return termRedirectHandler(req, res, '989');

  //   } else if (userType === 'Student') {
  //     // Students are redirected based on their course code
  //     return termRedirectHandler(req, res, camUser[0].course);

  //   } else {
  //     return res.send('Unrecognized CAM user type of ' + userType + ' for ' + userLogin);
  //   }
  // });
  
  // utils.resolveDestinationAsync(req.app.locals, userLogin, assignmentId, (err, destination) => {
  //   if (err) return res.send(err);
  //   return res.redirect(destination);
  // });
  
  // try {
  //   const destination = utils.resolveDestUsingLocals(req.app.locals, userLogin, assignmentId);
  //   return res.redirect(destination);
  // } catch (err) {
  //   return res.send(err);
  // }
}

/** 
 * Handler for LTI Post that redirects based on term code.
*/
function termRedirectHandler(req, res, termCode) {
  // Extract stuff we're interested in from the POST.
  const refererQueryParams = utils.extractQueryParams(req.headers['referer']);
  const assignmentId = refererQueryParams['assignment'];

  try {
    const destination = utils.resolveDestinationByTermCode(req.app.locals, termCode, assignmentId);
    return res.redirect(destination);
  } catch (err) {
    return res.send(err);
  }
}

/******************** Endpoint Routing ********************/
router.post('/params', endpointHandler);
// router.post('/params', postParamsHandler);

/******************** Exports ********************/
exports.router = router;
