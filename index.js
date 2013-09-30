var Type = require('type-of-is');
var RoutePattern = require('route-pattern');

function Router (routes) {
  this._matchers = [];
  this._not_found = null;
  
  if (arguments.length == 1) {
    this.route(routes);
  }
}

var _METHOD_PREFIX_REGEXP = /^(GET|HEAD|POST|UPDATE|DELETE) /;

// Define a set of routes or a single route
Router.prototype.route = function route (routes) {
  if (arguments.length === 2) {
    var name = arguments[0];
    var pattern = arguments[1];
    routes = {};
    routes[name] = pattern;
    
  } else if (arguments.length !== 1) {
    throw new TypeError('Route expects either (route_name, route_pattern) or ({ name1 : pattern 1, ...})');
  }
  
  for (route_name in routes) {
    var route = routes[route_name];
    
    var pattern;
    if (Type(route, String)) {
      pattern = route;
      method = null;
    
      var method_prefix = pattern.match(_METHOD_PREFIX_REGEXP);
      if (method_prefix) {
        pattern = pattern.slice(method_prefix[0].length);
        method = method_prefix[1];
      }
      
    } else if (Type(route, Object) && route.hasOwnProperty('pattern')) {
      pattern = route.pattern;
      method = (!!route.method) ? route.method : null;
    
    } else {
      throw new TypeError('Route pattern must be String or Object with pattern property');
    }
  
    pattern = RoutePattern.fromString(pattern);
  
    var matcher = {
      pattern: pattern,
      method: method,
      route_name: route_name
    };

    this._matchers.push(matcher);
  }
}

// Register a function to be called when no route is matched by an incoming 
// request
Router.prototype.notFound = function notFound (not_found) {
  this._not_found = not_found;
};

// Handle an incoming request and augment request object with params attribute
// if a match is made, then call next.
// If no match, invoke a notFound handler if one has been added. 
// Otherwise pass error to next middleware or write plaintext 404
//
// Note: Connect expects this method to be named 'handle'
Router.prototype.handle = function (req, res, next) {
  var params = this._match(req);

  if (params) {
    req.params = params;
    if (!!next) {
      next();
    }
    
  } else {
    if (this._not_found) {
      return this._not_found(req, res, next);
    }
    
    var error_message = '404 Not Found.';
    
    if (!!next) {
      var err = new Error(error_message);
      err.status = 404;
      return next(err);
      
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end(error_message);
    }
  }
  
}

// Checks whether there is a route matching this request. If there is a match,
// returns the matched route params, otherwise returns null.
Router.prototype._match = function _match (req) {
  for (var i = 0; i < this._matchers.length; i++) {
    var matcher = this._matchers[i];
    var pattern = matcher.pattern;
    
    if (matcher.method && (matcher.method !== req.method)) {
      continue;
    }
    
    if (pattern.matches(req.url)) {
      var params = pattern.match(req.url).namedParams;
      params.route_name = matcher.route_name;
      return params;
    }
  }
  return null;
};

module.exports = Router;