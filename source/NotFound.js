// NotFound
// ========
// constructor
// -----------
// Route returned when no route is matched. Instances
// are api compatible with [MatchedRoute](./MatchedRoute.html)
// ### required arguments
// **url** : the url to be returned for this route
function NotFound (url) {
  this._url    = url;
  this.name    = 'NotFound';
  this.params  = {};
  this.pattern = null;
}

// url
// ---
// return the url for this route
NotFound.prototype.url = function () {
  return this._url;
};

// notFound 
// --------
// Convenience method used by handle in [Router](./Router.html) 
NotFound.prototype.notFound = function () {
  return true;
};

module.exports = NotFound;