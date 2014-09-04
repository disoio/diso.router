diso.router
===========

Description
-----------
Simple router for client and server, using [RoutePattern](https://github.com/bjoerge/route-pattern/) for named param matching. On server, works with plain node HTTP and as [Connect](https://github.com/senchalabs/connect) middleware. 

Latest Version
--------------
6.0.0

Installation
------------
```shell
npm install --save diso.router
```

or in package.json

```json
{
  ...
  "dependencies": {
    "diso.router": "~6.0.0"
  }
}
```

Usage
-----
### Instantiate the router 
```javascript
var Router = require('diso.router');

// define some routes
var routes = {
  Show       : 'GET /show/:title',
  CreateShow : 'POST /show',
  OMG        : '/omg/:zomg',
  Derp       : {
    pattern : '/derp/:wow',
    method  : 'GET'
  }
};

// Note HTTP verb is optional, and routes can be 
// specified using a string or an object

// create router and add routes
var router = new Router();
router.addRoutes(routes);

// shorter way of doing the same thing
var router = new Router(routes);

// add single routes with .addRoute(<name>, <route>)
router.addRoute('Home', '/');

// register optional 404 handler to deal with urls 
// that don't match any routes
router.notFound(function (req, res) { 
  res.end("404!");
});
```

### Use it with basic HTTP
```javascript
HTTP.createServer(function (req, res, next) {
  router.handle(req, res);
  // assuming request was /show/derp
  // req.route is now
  // {
  //   name   : 'Show',
  //   params : {
  //     title : 'derp'
  //   }
  // }
});
```

### or as [Connect](https://github.com/senchalabs/connect) middleware
```javascript
Connect().use(router).use(function (req, res, next) {
  // req.route same as above
});
```

### or match can be used directly on client or server
```javascript
var route = router.match({
  path : '/derp/4ever'
}); 
// route = {
//   name   : 'Derp',
//   params : {
//     wow: '4ever'
//   }
// }

var path = router.match({
  route : {
    name : 'Show',
    params : {
      title : 'barf'
      page  : 10
   }
}}).path();
// path = '/show/barf?page=10'
```

License
-------
[MIT](https://raw.github.com/stephenhandley/diso.router/master/LICENSE.txt)

TODO
----
- instead of iterating over array could use prefix trie like https://github.com/c9s/r3 but prolly not worth the time
- include post data in route params? 
- rewrite without RoutePattern and ditch query param / hash naming, allow for optional params? 
- docco -o docs source/*.js