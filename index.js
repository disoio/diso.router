var Type = require('type-of-is');
var RoutePattern = require('route-pattern');

function Router () {
  this._matchers = [];
  this._not_found = null;
}

var _METHOD_PREFIX_REGEXP = /^(GET|HEAD|POST|UPDATE|DELETE) /;

// delegate from a routes object to an object with req/res handlers
// this function uses .map below for most of the work
Router.prototype.delegate = function delegate (routes, actions) {
  for (route_name in routes) {
    var action = actions[route_name];
    if (!action) {
      throw (route_name + " not defined in actions passed to dispath or map");
    }
    
    var route = routes[route_name];
    
    this.map(route_name, route, action);
  }
};

// map a single route to a single action
Router.prototype.map = function map (route_name, route, action) {
  var pattern;
  if (Type(route, String)) {
    pattern = route;
    method = null;
    
    var method_prefix = pattern.match(_METHOD_PREFIX_REGEXP);
    if (method_prefix) {
      pattern = pattern.slice(method_prefix[0].length);
      method = method_prefix[1];
    }
    
  } else {
    pattern = route.pattern;
    method = (!!route.method) ? route.method : null;
  }
  
  pattern = RoutePattern.fromString(pattern);
  
  var matcher = {
    pattern: pattern,
    action: action,
    method: method,
    route_name: route_name
  };

  this._matchers.push(matcher);
}

// register a req/res action to be called when no route is matched
// by an incoming request
Router.prototype.notFound = function notFound (not_found) {
  this._not_found = not_found;
};

// dispatch an incoming request through the router, so the appropriate
// req/res action handles it
Router.prototype.dispatch = function dispatch (req, res, next) {
  var action = this._match(req);
  
  if (action) {
    return action(req, res, next);  
  } 
  
  if (this._not_found) {
    return this._not_found(req, res, next);
  } 
  
  var error_message = '404 Not Found.';
  if (!!next) {
    var err = new Error(error_message);
    err.status = 404;
    next(err);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end(error_message);
  }
}

// Alias dispatch as "handle", which is what Connect middleware looks for
Router.prototype.handle = Router.prototype.dispatch;

// if match return action and set req.params to RoutePattern namedParams
// if no match return null 
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
      req.params = params;
      return matcher.action;
    }
  }
  return null;
};

module.exports = Router;