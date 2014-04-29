var Assert = require('assert');
var Asserts = require('asserts');
var Router = require('../');

var routes = {
  show: 'GET /show/:title',
  createShow: 'POST /show',
  event: { pattern: '/event/:date', method: 'GET' },
  overlyComplicated : '/hello/:planet?foo=:foo&fruit=:fruit#:section',
  home: '/'
};

var end = function (req, res) { res.end() };
var actions = {
  home: end,
  show: end,
  event: end,
  createShow: end,
};

var router = new Router(routes);

module.exports = {
  'diso.router using basic HTTP should': {
    'properly handle': {
      'empty route matcher': function (done) {
        var req = { method: 'GET', url: '/' };
        router.handle(req, {});
        Assert.equal(req.route.name, 'home');
        Assert.equal(Object.keys(req.route.params).length, 0);
        done();
      },
      
      'named param route': function (done) {
        var req = { method: 'GET', url: '/show/barf' };
        router.handle(req, {});
        Assert.equal(req.route.name, 'show');
        Assert.equal(req.route.params.title, 'barf');
        done();
      },
      
      'object based route': function (done) {
        var date = '122312';
        var req = { method: 'GET', url: '/event/' + date }
        router.handle(req, {});
        Assert.equal(req.route.name, 'event');
        Assert.equal(req.route.params.date, date);
        done();
      },
      
      'route using POST': function (done) {
        var req = { method: 'POST', url: '/show' };
        router.handle(req, {});
        Assert.equal(req.route.name, 'createShow');
        done();
      },
      
      'single mapped route': function (done) {
        var doh_route_name = 'doh';
        var doh_url = '/dohdohdoh';
        router.route(doh_route_name, doh_url);
        var req = { method: 'GET', 'url': doh_url };
        router.handle(req, {});
        Assert.equal(req.route.name, doh_route_name);
        done();
      },
      
      'overly complicated route': function (done) {
        var oc_route_name = 'overlyComplicated';
        var oc_url = '/hello/earth?foo=bar&fruit=apple#chapter2';
        router.route(oc_route_name, oc_url);
        var req = { method: 'GET', 'url': oc_url };
        router.handle(req, {});
        Assert.equal(req.route.name, oc_route_name);
        done();
      },
      
      'unmatched route by': {
        'rendering 404 text when notFound is not set': function (done) {
          var req = { method: 'GET', url: '/barf' };
          router.handle(req, { 
            writeHead: function (status, headers) {
              Assert.equal(status, 404);
            }, 
            end : function (txt) {
              Assert.equal(txt, '404 Not Found.'); 
              done();
            }
          });
        },
        'calling notFound when it is set': function (done) {
          var req = { method: 'GET', url: '/barf' };
          router.notFound(function (req, res) {
            Assert.equal(1, 1);
            done();
          });
          router.handle(req, { end : function () {
            // shouldn't ever get here
            Assert.equal(1, 0);
            done();
          }});
        }
      }
    }
  }
};