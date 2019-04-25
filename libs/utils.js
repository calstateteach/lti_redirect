/* Utility functions
08.27.2018 tps Created.
05.04.2018 tps Don't pre-fetch CAM student list.
05.04.2018 tps Add lookup of destination starting with term code.
05.24.2018 tps Lookup user role with CAM user search instead of student list.
05.24.2018 tps Fix missing logic for default destination.
10.16.2018 tps Fix bad callback logic for error during CAM call.
01.28,2019 tps Fix parsing referer URL with no query parameters.
*/


const async = require('async');
const csvUtils = require('./csvUtils');

/**
 * Simple-minded function to extract query parameters at the
 * end of a referer URL into properties of an object.
 **/
function extractQueryParams(url) {
  var retObj = {};
  if (!url) return retObj; // I got nuthin'
  var queryString = url.split('?')[1];
  if (!queryString) return retObj; // No query parameters to parse out.
  var queryPairs = queryString.split('&');
  for (pair of queryPairs) {
    var param = pair.split('=');
    retObj[param[0]] = param[1];
  }
  return retObj;
}

// /**
//  * Function that does the main business of looking up
//  * destination URL for a given student & assignment.
//  * Throws exception if it fails to find a destination.
//  * 
//  * emailLogin: String specifying email address of student we want to redirect.
//  * assignmentName: String specifying assignment name we are redirecting for.
//  * studentList: Arrary of row objects returned from student list CAM API call.
//  * term2DestGroup: Array of row objects mapping terms to destination groups.
//  * ass2Dest: Array of row objects mapping assignment names to destinations.
//  * defaultDestUrl: Default destination to use for empty destinations in assignments collection
//  */
// function resolveDestination(emailLogin, assignmentName, studentList, term2DestGroup, ass2Dest, defaultDestUrl) {

//   // Lookup the user's term
//   const student = studentList.find( e => e.email === emailLogin);
//   if (!student) throw `No record found for ${emailLogin} in CAM student list.`;
//   const termCode = student.course;

//   // Lookup the terms's destination group
//   const term = term2DestGroup.find( e => e.Term === termCode);
//   if (!term) throw `No destination group found for term ${termCode}.`;
//   const destinationGroup = term.Destination_group

//   // Lookup the destination for the assignment
//   const assignment = ass2Dest.find( e => e.assignment_name === assignmentName);
//   if (!assignment) throw `No destination record found for assignment ${assignmentName}`;
//   const destination = assignment[destinationGroup] || defaultDestUrl;
//   // destination = assignment[destinationGroup];
//   // if (!destination) throw `No destination found for assignment ${assignmentName}, destination group ${destinationGroup}`;
//   return destination;
// }

// /**
//  * Version of resolveDestination that uses lookup tables already in local storage.
//  */

// function resolveDestUsingLocals(locals, emailLogin, assignmentName) {
//   // Extract parameters from local storage
//   const term_map =        locals.map_term2dest;
//   const assignment_map =  locals.map_ass2group;
//   const studentList =     locals.student_list;
//   const defaultDestUrl =  locals.default_dest;
//   return resolveDestination(
//     emailLogin,
//     assignmentName,
//     studentList,
//     term_map,
//     assignment_map,
//     defaultDestUrl);
// }

// /**
//  * Resolve destination, querying CAM student list for each request.
//  * Callback signature: (err, destinationUrl)
//  */
// function resolveDestinationAsync(locals, emailLogin, assignmentName, callback) {
//   csvUtils.parseUrl(process.env.CAM_STUDENT_LIST_URL, (err, studentList) => {
//     if (err) {
//       return callback('Unable to lookup redirect URL. CAM student list error: ' + err);
//     }

//     try {
//       const redirectUrl = resolveDestination(
//         emailLogin,
//         assignmentName,
//         studentList,
//         locals.map_term2dest,
//         locals.map_ass2group,
//         locals.default_dest);
//       return callback(null, redirectUrl);
//     } catch (resolveErr) {
//       console.log('resolveDestinationAsync err:', resolveErr);
//       return callback(resolveErr);
//     }
//   });
// }


function resolveDestinationByEmail(locals, email, assignmentName, callback) {
  // callback signature: (err, <Destination URL>)

  lookupCamUser(email, (err, camUser) => {
    if (err) return callback(err);

    if (camUser.length < 1) return callback('No CAM entry found for ' + email);

    const userType = camUser[0].user_type;
    if (userType === 'Faculty') {
      // Faculty are redirected as if in term 1 / destination 1
      try {
        return callback(null, resolveDestinationByTermCode(locals, '989', assignmentName));
      } catch (resolveErr) {
        return callback(resolveErr);
      }
    } else if (userType === 'Student') {
      // Students are redirected based on their course code
      try {
        return callback(null, resolveDestinationByTermCode(locals, camUser[0].course, assignmentName));
      } catch (resolveErr) {
        return callback(resolveErr);
      }

    } else {
      return callback('Unrecognized CAM user type of ' + userType + ' for ' + email);
    }
  }); // end CAM user lookup callback
}

/**
 * Resolve the destination starting with term code.
 * Throw exceptions if fail to find a destination.
 * 
 * locals: App locals objects containing pre-fetched lookup tables.
 * termCode: Integer term code.
 * assignmentName: assignment name to lookup.
 */
function resolveDestinationByTermCode(locals, termCode, assignmentName) {
    // Lookup the terms's destination group
    const term = locals.map_term2dest.find( e => e.Term === termCode);
    if (!term) throw `No destination group found for term ${termCode}.`;
    const destinationGroup = term.Destination_group

    // Lookup the destination for the assignment
    const assignment = locals.map_ass2group.find( e => e.assignment_name === assignmentName);
    if (!assignment) throw `No destination record found for assignment ${assignmentName}`;
    //const destination = assignment[destinationGroup] || defaultDestUrl;
    const destination = assignment[destinationGroup] || process.env.DEFAULT_DESTINATION;
    return destination;
}

// /** 
//  * Router endpoint handler for looking up destination URL,
//  * for use by both AJAX endpoint & LTI endpoint.
//  * 
//  * userLogin: student email
//  * assignmentName: assignment name
//  * appLocals: the application locals object, for looking up config file data.
//  * callback signature: (err, destination)
//  */
//  function lookupDestination(userLogin, assignmentName, appLocals, callback) {
//   // Extract stuff we're interested in from the POST.
//   // const refererQueryParams = extractQueryParams(req.headers['referer']);
//   // const userLogin = req.body['custom_canvas_user_loginid'];
//   // const assignmentName = refererQueryParams['assignment'];
  
//   // const email = req.params.email;
//   // const assignment = req.params.assignment;

//   csvUtils.parseUrl(process.env.CAM_STUDENT_LIST_URL, (err, studentList) => {
//     if (err) return callback(err);

//     try {
//       const destination = resolveDestination(
//         userLogin,
//         assignmentName,
//         studentList,
//         appLocals.map_term2dest,
//         appLocals.map_ass2group);
//         // req.app.locals.map_term2dest,
//         // req.app.locals.map_ass2group);
//       return callback(null, destination);
//     } catch (lookupError) {
//       return callback(lookupError);
//     }
//   });
//  }

/**
 * Load configuration lookup tables into local storage.
 * Callback signature: (err)
 */

 function loadLookupTables(localsObj, callback) {
   // Start loading configuration files & start the Web app when done.
  async.parallel([
    csvUtils.parseFileFunction('./config/assignments.csv'),
    csvUtils.parseFileFunction('./config/terms.csv'),
    // csvUtils.parseUrlFunction(process.env.CAM_STUDENT_LIST_URL)
  ], doneLoading);

function doneLoading(err, results) {
  if (err) return callback(err);
  localsObj['map_ass2group'] = results[0];
  localsObj['map_term2dest'] = results[1];
  // localsObj['student_list'] = results[2];
  localsObj['default_dest'] = process.env.DEFAULT_DESTINATION;
  localsObj['load_timestamp'] = new Date();
  return callback();
}
 }

/**
 * Retrieve CAM user object by email.
 * callback signature: (err, <CAM user object>)
 */

function lookupCamUser(email, callback) {
  const camUrl = process.env.CAM_USER_SEARCH_URL.replace('${userEmail}', email);
  csvUtils.parseUrl(camUrl, (err, camUser) => {
    if (err) return callback(err);
    return callback(null, camUser);
  });
}


/******************** Exports ********************/
exports.extractQueryParams = extractQueryParams;
// exports.resolveDestination = resolveDestination;
// exports.lookupDestination = lookupDestination;
exports.loadLookupTables = loadLookupTables;
// exports.resolveDestUsingLocals = resolveDestUsingLocals;
// exports.resolveDestinationAsync = resolveDestinationAsync;
exports.resolveDestinationByEmail = resolveDestinationByEmail;
exports.resolveDestinationByTermCode = resolveDestinationByTermCode;
exports.lookupCamUser = lookupCamUser;
