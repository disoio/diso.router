diso.router
===========

Delegation based routing

```
var Router = require('diso.router');
var router = new Router();

var routes = {
  showShow: 'GET /show/:title',
  createShow: 'POST /show',
  home: '/'
}

var actions = {
  showShow   : function (req, res) { res.end("SHOW " + req.route.params.title ); },
  createShow : function (req, res) { res.end("SHOW" + req.route.params.title ); },
};

router.delegate(routes, actions);

// add more batches with .delegate
router.delegate(more_routes, some_actions_in_different_object);

// or add a single route with .map(<name>, <route>, <handler>)
router.map('home', '/', function (req, res) { res.end('HOME!'); });

```

TODO
====
- support route generation via name and params
- include post data in route params? 