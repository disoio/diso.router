// NPM dependencies
// ----------------
// [type-of-is](https://github.com/stephenhandley/type-of-is)  
var Type = require('type-of-is');

// Local dependencies
// ------------------ 
// [Route](./Route.html)  
// [NotFound](./NotFound.html)  
var Route    = require('./Route');
var NotFound = require('./NotFound');

// Router
// ======
// constructor
// -----------
// create a router
// ### optional arguments
// **routes**  : routes to add
function Router (routes) {
  this._routes        = [];
  this._not_found     = null;
  this._not_found_url = '/404';
  
  if (arguments.length === 1) {
    this.addRoutes(routes);
  }
}

// Regular expression for matching HTTP verb prefix in routes
var _METHOD_PREFIX_REGEXP = /^(GET|HEAD|POST|UPDATE|DELETE) /;

// addRoute
// --------
// Add a single route
Router.prototype.addRoute = function addRoute (route_name, route_pattern) {
  if (arguments.length !== 2) {
    throw new TypeError('addRoute expects two arguments: (route_name, route_pattern)');
  }

  var routes = {};
  routes[route_name] = route_pattern;
  this.addRoutes(routes);
};

// addRoutes
// ---------
// Add multiple routes. Routes can be specified as plain string 
// or as object with pattern and method attributes
Router.prototype.addRoutes = function addRoutes (routes) {
  if (arguments.length !== 1) {
    throw new TypeError('addRoutes expects argument with { routename1 : routepattern 1, ...}');
  }
  
  for (var route_name in routes) {
    if (!routes.hasOwnProperty(route_name)) {
      continue;
    }
    
    var route = routes[route_name];
    
    var pattern;
    var method;

    if (Type(route, String)) {
      pattern = route;
      method  = null;
      
      // check for a HTTP verb prefix
      var method_prefix = pattern.match(_METHOD_PREFIX_REGEXP);
      if (method_prefix) {
        pattern = pattern.slice(method_prefix[0].length);
        method  = method_prefix[1];
      }
      
    } else if (Type(route, Object) && route.hasOwnProperty('pattern')) {
      pattern = route.pattern;
      method  = ('method' in route) ? route.method : null;
    
    } else {
      throw new TypeError('Route pattern must be String or Object with pattern property');
    }
    
    route = new Route({
      pattern : pattern,
      method  : method,
      name    : route_name
    });

    this._routes.push(route);
  }
};

// route
// -----
// Find a route by its name
Router.prototype.route = function route (name) {
  var num_routes = this._routes.length;

  // Look through the routes for a route with matching name
  for (var i = 0;  i < num_routes; i++) {
    var route = this._routes[i];
    if (route.name === name) {
      return route;
    }
  }

  return null;
};

// notFound
// --------
// Optionally register a function to be called when no route 
// is matched by handle
Router.prototype.notFound = function notFound (not_found) {
  this._not_found = not_found;
};

// notFoundUrl
// -----------
// Optionally set the url that is returned in the [NotFound](./NotFound.html)
// route. This is only set when a route-based match fails,
// for url-based matches, the specified url is used.
Router.prototype.notFoundUrl = function notFoundUrl (url) {
  this._not_found_url = url;
}

// handle
// ------
// Process incoming request and augment request object with route
// 
// This function can be called directly when using basic http, and 
// also invoked by [connect](https://github.com/senchalabs/connect) middleware. 
Router.prototype.handle = function (req, res, next) {
  req.route = this.match({
    url    : req.url,
    method : req.method
  });

  // call the not found handler if its been set
  if (req.route.notFound() && this._not_found) {
    return this._not_found(req, res, next);
  }

  // Connect looks for a function named "handle" that is expected to
  // call next when done processing. Next is not needed when calling
  // handle directly
  if (!!next) {
    next();
  }
};

// match
// -----
// Checks whether there is a route matching the passed url or route
// data. If there is a match, it returns a [MatchedRoute](./MatchedRoute.html) 
// otherwise returns [NotFound](./NotFound.html).
Router.prototype.match = function match (args) {  
  for (var i = 0; i < this._routes.length; i++) {
    var route = this._routes[i];
    var matched_route = route.match(args);
    if (matched_route) {
      return matched_route;
    }
  }
  
  // if a route arg was passed and it didn't match anything then there's
  // no way to construct a url so set it to _not_found_url, which defaults
  // to /404 and can be set via notFoundUrl
  var url = ('url' in args) ? args.url : this._not_found_url;
  var not_found = new NotFound(url);

  return not_found;
};

module.exports = Router;