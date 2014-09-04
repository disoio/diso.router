// NotFound
// ========
// constructor
// -----------
// Route returned when no route is matched. Instances
// are api compatible with [MatchedRoute](./MatchedRoute.html)
// ### required arguments
// **path** : the path to be returned for this route
function NotFound (path) {
  this._path   = path;
  this.name    = 'NotFound';
  this.params  = {};
  this.pattern = null;
}

// path
// ----
// return the path for this route
NotFound.prototype.path = function () {
  return this._path;
};

// notFound 
// --------
// Convenience method used by handle in [Router](./Router.html) 
NotFound.prototype.notFound = function () {
  return true;
};

module.exports = NotFound;