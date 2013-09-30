diso.router
===========

Description
-----------
Simple router that augments request object with params, using [RoutePattern](https://github.com/bjoerge/route-pattern/) for named param matching. 

Latest Version
--------------
2.0.0

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
    "diso.router": "2.0.0"
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
  req.end('Title is ' + req.params.title);
}).listen(8000, '127.0.0.1');

// or as Connect middleware
// (assuming you've changed the signatures of action and notFound functions above to (req, res, next))
var app = Connect();
app.use(router);
```

License
-------
[MIT](https://raw.github.com/stephenhandley/diso.router/master/LICENSE.txt)

TODO
----
- support route generation via name and params
- include post data in route params? 