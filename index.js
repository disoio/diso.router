var Type = require('type-of-is');
var RoutePattern = require('route-pattern');

function Router () {
  this.matchers = [];
  this.not_found = null;
}

// if match return handler and set req.params to RoutePattern namedParams
// if no match return null 
Router.prototype.match = function match (req) {
  for (var i = 0; i < this.matchers.length; i++) {
    var matcher = this.matchers[i];
    var pattern = matcher.pattern;
    
    if (matcher.method && (matcher.method !== req.method)) {
      continue;
    }
    
    if (pattern.matches(req.url)) {
      var params = pattern.match(req.url).namedParams;
      params.action = matcher.action;
      req.params = params;
      return matcher.handler;
    }
  }
  return null;
};

Router.prototype.dispatch = function dispatch (req, res, next) {
  var handler = this.match(req);
  
  if (handler) {
    return handler(req, res, next);  
  } 
  
  if (this.not_found) {
    return this.not_found(req, res, next);
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

// hook for middleware
Router.prototype.handle = Router.prototype.dispatch;

var METHOD_PREFIX_REGEXP = /^(GET|HEAD|POST|UPDATE|DELETE) /;

Router.prototype.map = function map (action, route, handler) {
  var pattern;
  if (Type(route, String)) {
    pattern = route;
    method = null;
    
    var method_prefix = pattern.match(METHOD_PREFIX_REGEXP);
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
    handler: handler,
    method: method,
    action: action
  };

  this.matchers.push(matcher);
}

Router.prototype.delegate = function delegate (routes, handlers) {
  for (action in routes) {
    var handler = handlers[action];
    if (!handler) {
      throw (action + " not defined in handlers");
    }
    
    var route = routes[action];
    
    this.map(action, route, handler);
  }
};

Router.prototype.notFound = function noMatch (not_found) {
  this.not_found = not_found;
};

module.exports = Router;