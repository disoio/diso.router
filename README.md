diso.router
===========

Description
-----------
Simple router that augments request object with params, using [RoutePattern](https://github.com/bjoerge/route-pattern/) for named param matching. 

Latest Version
--------------
3.0.0

Installation
------------
```
npm install --save diso.router
```

or in package.json

```json
{
  ...
  "dependencies": {
    "diso.router": "3.0.0"
  }
}
```

Usage
-----
```
var HTTP = require('http');
var Router = require('diso.router');

var routes = {
  showShow: 'GET /show/:title',
  createShow: 'POST /show'
}

var router = new Router();
router.route(routes);
// or equivalently 
// var router = new Router(routes);

// add more batches with .route
// router.route(more_routes);

// or add a single route with .route(<name>, <route>)
router.route('home', '/');

// 404
router.notFound(function (req, res) { res.end("wildcard or 404 or blah"); });

// Use via basic HTTP
var server = HTTP.createServer(function (req, res) {
  router.handle(req, res);
  req.end("Route name is " + req.params.route_name + " and title is " + (req.params.title || ''));
}).listen(8000, '127.0.0.1');

// or as Connect middleware
// (assuming you've changed the signatures notFound to (req, res, next))
var app = Connect();
app.use(router);

// or client side
router.match({url: '/barf/4ever'})

// route formatting
router.format({
  name : 'show',
  params : {
    title: 'barf'
  }
}) //RETURNS /show/barf
```

License
-------
[MIT](https://raw.github.com/stephenhandley/diso.router/master/LICENSE.txt)

TODO
----
- include post data in route params? 
- rewrite without RoutePattern and ditch query param / hash naming, allow for optional params? 