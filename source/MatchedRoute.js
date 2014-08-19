// Core dependencies
// -----------------
// [url](http://nodejs.org/api/url.html) 
var Url  = require('url');

// MatchedRoute
// ============
// constructor
// -----------
// create a matched route that can construct a url
// using the matched params and route pattern
// ### required arguments
// **name**    : name for this route
//
// **params**  : params for this route
//
// **pattern** : pattern for this route
function MatchedRoute (args) {
  this.name    = args.name;
  this.params  = args.params;
  this.pattern = args.pattern;
}

// url
// ---
// return the url for this route by substituting
// params for their occurence in this route's pattern
MatchedRoute.prototype.url = function url () {
  var pattern = this.pattern; 
  var params  = this.params;

  function _substitute (str, k) {
    var placeholder = ':' + k;
    var value = params[k];
    str = str.replace(placeholder, value);
    delete params[k];
    return str;
  }
  
  var path = pattern.pathPattern.routeString;
  var path_param_names = pattern.pathPattern.params;
  if (path_param_names.length) {
    path_param_names.forEach(function (k) {
      path = _substitute(path, k);
    });
  }
  
  var hash = null;
  if (pattern.hashPattern) {
    hash_param_names = pattern.hashPattern.params;
    hash = pattern.hashPattern.routeString;
    hash_param_names.forEach(function (k) {
      hash = _substitute(hash, k);
    });
  }
  
  var url_params = {
    pathname : path,
    query    : params
  }
  
  if (hash) {
    url_params.hash = hash;
  }

  return Url.format(url_params);
}

// notFound 
// --------
// Convenience method used by handle in [Router](./Router.html) 
MatchedRoute.prototype.notFound = function () {
  return false;
}

module.exports = MatchedRoute;