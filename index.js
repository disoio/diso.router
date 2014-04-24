var Type = require('type-of-is');
var RoutePattern = require('route-pattern');
var Url = require('url')

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

Router.prototype.format = function format (options) {
  var route_name = options.route;
  var params = options.params;
  
  // find matching route
  var pattern = null;
  for (var i = 0, len = this._matchers.length; i < len; i++) {
    var matcher = this._matchers[i];
    if (matcher.route_name === route_name) {
      pattern = matcher.pattern;
      break;
    }
  }
  
  if (!pattern) {
    var err = "No route named " + route_name;
    throw err;
  }
  
  var path_param_names = pattern.pathPattern.params;
  
  var hash_param_names = []
  if (pattern.hashPattern) {
    hash_param_names = pattern.hashPattern.params;
  }
  
  var qs_param_names = []
  if (pattern.queryStringPattern) {
    for (var i = 0, len = pattern.queryStringPattern.params.length; i < len; i++) {
      var param = pattern.queryStringPattern.params[i];
      qs_param_names.push(param.name);
    }
  }
    
  var all_param_names = path_param_names.concat(hash_param_names, qs_param_names);
  
  for (var i = 0, len = all_param_names.length; i < len; i++) {
    var param_name = all_param_names[i];
    if (!(param_name in params)) {
      var err = route_name + ' is missing expected param ' + param_name;
      throw err;
    }
  }
    
  function _substitute (str, k) {
    var placeholder = ':' + k;
    var value = params[k];
    str = str.replace(placeholder, value);
    delete params[k];
    return str;
  }
  
  var path = pattern.pathPattern.routeString;
  if (path_param_names.length) {
    path_param_names.forEach(function (k) {
      path = _substitute(path, k);
    });
  }
  
  var hash = null;
  if (hash_param_names.length) {
    hash = pattern.hashPattern.routeString;
    hash_param_names.forEach(function (k) {
      hash = _substitute(hash, k);
    });
  }
  
  var url_params = {
    pathname : path,
    query : params
  }
  
  if (hash) {
    url_params.hash = hash;
  }

  return Url.format(url_params);
}

// Handle an incoming request and augment request object with params attribute
// if a match is made, then call next.
// If no match, invoke a notFound handler if one has been added. 
// Otherwise pass error to next middleware or write plaintext 404
//
// Note: Connect expects this method to be named 'handle'
Router.prototype.handle = function (req, res, next) {
  var params = this.match(req);

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
Router.prototype.match = function match (options) {
  var url = options.url;
  
  for (var i = 0; i < this._matchers.length; i++) {
    var matcher = this._matchers[i];
    var pattern = matcher.pattern;
    
    if (matcher.method && options.method && (matcher.method !== options.method)) {
      continue;
    }
    
    if (pattern.matches(url)) {
      var match = pattern.match(url);
      var params = match.namedParams;
      params.route_name = matcher.route_name;
      return params;
    }
  }
  return null;
};

module.exports = Router;