var Type = require('type-of-is');
var RoutePattern = require('route-pattern');

function Router () {
  this.matchers = [];
  this.not_found = null;
}

Router.prototype.route = function route (req, res) {
  for (var i = 0; i < this.matchers.length; i++) {
    var matcher = this.matchers[i];
    var pattern = matcher.pattern;
    
    if (matcher.method && (matcher.method !== req.method)) {
      continue;
    }
    
    if (pattern.matches(req.url)) {
      req.route = {
        params: pattern.match(req.url).namedParams,
        action: matcher.action
      };
      return matcher.handler(req, res);
    }
  }
  
  if (this.not_found) {
    this.not_found(req, res);
  } else {
    res.end('404');
  }
};

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
    handler.bind(handlers);
    
    var route = routes[action];
    
    this.map(action, route, handler);
  }
};

Router.prototype.notFound = function noMatch (not_found) {
  this.not_found = not_found;
};

module.exports = Router;