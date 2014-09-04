// NPM dependencies
// ----------------
// [RoutePattern](https://github.com/bjoerge/route-pattern/)  
var RoutePattern = require('route-pattern');  

// Local dependencies
// ------------------ 
// [MatchedRoute](./MatchedRoute.html)  
var MatchedRoute = require('./MatchedRoute');

// Route
// =====
// constructor
// -----------
// create a route that can be used for matching 
// ### required arguments
// **name**    : name for this route
//
// **pattern** : pattern for this route
// 
// ### optional arguments
// **method**  : specify HTTP method for this route
function Route (args) {
  this.name    = args.name;
  this.method  = args.method;
  var pattern  = args.pattern;
  this.pattern = RoutePattern.fromString(pattern);
}

// match
// -----
// Try to match this route to args object, which can specify
// match target as path or route (name, params) and optional
// method. 
// returns [MatchedRoute](./MatchedRoute.html) on a match otherwise null
Route.prototype.match = function match (args) {
  var fn_name = ('path' in args) ? '_matchPath' : '_matchRoute';
  return this[fn_name].call(this, args);
}


// _matchPath
// ----------
// Try to match this route to the path in args object
// returns [MatchedRoute](./MatchedRoute.html) on a match otherwise null
Route.prototype._matchPath = function matchPath (args) {
  var path    = args.path;
  var method  = args.method;
  var pattern = this.pattern;

  if (this.method && method && (this.method !== method)) {
    return null;
  }
  
  if (pattern.matches(path)) {
    // uses [RoutePattern](https://github.com/bjoerge/route-pattern/) for matching
    var match = pattern.match(path);

    return new MatchedRoute({
      name    : this.name,
      params  : match.namedParams,
      pattern : pattern
    });
  } else {
    return null;
  }
};

// _matchRoute
// -----------
// Try to match this route with the route in args object. For a match to 
// occur, two conditions have to be met:
// 1. route names have to match
// 2. all params specified in the pattern need to be present
// returns [MatchedRoute](./MatchedRoute.html) on a match otherwise null
Route.prototype._matchRoute = function (args) {
  var route   = args.route;
  var name    = route.name;
  var params  = route.params;
  var pattern = this.pattern;

  // condition 1
  if (name != this.name) {
    return null;
  }

  // gather all the param names 
  var all_param_names = (function () {
    var path_param_names = pattern.pathPattern.params;
    
    var hash_param_names = []
    if (pattern.hashPattern) {
      hash_param_names = pattern.hashPattern.params;
    }
    
    var qs_param_names = []
    if (pattern.queryStringPattern) {
      var qs_pattern = pattern.queryStringPattern;
      var num_params = qs_pattern.params.length;

      for (var i = 0; i < num_params; i++) {
        var param = qs_pattern.params[i];
        qs_param_names.push(param.name);
      }
    }
      
    return path_param_names.concat(hash_param_names, qs_param_names);
  })();

  // condition 2
  var num_params = all_param_names.length;
  for (var i = 0; i < num_params; i++) {
    var param_name = all_param_names[i];
    if (!(param_name in params)) {
      return null;
    }
  }

  // All named params are present, its a match
  return new MatchedRoute({
    name    : this.name,
    params  : params,
    pattern : pattern
  });
}

module.exports = Route;