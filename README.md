diso.router
===========

# Description

Delegation based routing

# Latest Version

1.0.0

# Installation
```
npm install diso.router
```

or in package.json

```json
{
  ...
  "dependencies": {
    "diso.router": "1.0.0"
  }
}
```

# Usage

```
var HTTP = require('http');
var Router = require('diso.router');

var router = new Router();

var routes = {
  showShow: 'GET /show/:title',
  createShow: 'POST /show'
}

var actions = {
  showShow   : function (req, res) { res.end("SHOW " + req.route.params.title ); },
  createShow : function (req, res) { res.end("SHOW" + req.route.params.title ); }
};

router.delegate(routes, actions);

// add more batches with .delegate
// router.delegate(more_routes, some_other_actions_in_different_object);

// or add a single route with .map(<name>, <route>, <handler>)
router.map('home', '/', function (req, res) { res.end('HOME!'); });

// 404
router.notFound(function (req, res) { res.end("wildcard or 404 or blah"); });

// Use via basic HTTP
var server = HTTP.createServer(function (req, res) {
  router.dispatch(req, res);
}).listen(8000, '127.0.0.1');

// or as Connect middleware
var app = Connect();
app.use(router);
```

#TODO
- support route generation via name and params
- include post data in route params? 