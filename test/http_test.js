var Assert = require('assert');
var Asserts = require('asserts');
var Router = require('../');

var routes = {
  show: 'GET /show/:title',
  createShow: 'POST /show',
  event: { pattern: '/event/:date', method: 'GET' },
  home: '/'
};

var end = function (req, res) { res.end() };
var handler = {
  home: end,
  show: end,
  event: end,
  createShow: end,
};

var router = new Router();
router.delegate(routes, handler);

module.exports = {
  'diso.router using basic HTTP should': {
    'properly handle': {
      'empty route matcher': function (done) {
        var req = { method: 'GET', url: '/' };
        router.dispatch(req, { end : function () {
          Assert.equal(req.params.action, 'home');
          Assert.equal(Object.keys(req.params).length, 1);
          done();
        }});
      },
      
      'named param route': function (done) {
        var req = { method: 'GET', url: '/show/barf' };
        router.dispatch(req, { end : function () {
          Assert.equal(req.params.action, 'show');
          Assert.equal(req.params.title, 'barf');
          done();
        }});
      },
      
      'object based route': function (done) {
        var date = '122312';
        var req = { method: 'GET', url: '/event/' + date }
        router.dispatch(req, { end : function () {
          Assert.equal(req.params.action, 'event');
          Assert.equal(req.params.date, date);
          done();
        }});
      },
      
      'route using POST': function (done) {
        var req = { method: 'POST', url: '/show' };
        router.dispatch(req, { end : function () {
          Assert.equal(req.params.action, 'createShow');
          done();
        }});
      },
      
      'single mapped route': function (done) {
        var doh_action = 'doh';
        var doh_url = '/dohdohdoh';
        router.map(doh_action, doh_url, end);
        var req = { method: 'GET', 'url': doh_url };
        router.dispatch(req, { end : function () {
          Assert.equal(req.params.action, doh_action);
          done();
        }});
      },
      
      'unmatched route by': {
        'rendering 404 text when notFound is not set': function (done) {
          var req = { method: 'GET', url: '/barf' };
          router.dispatch(req, { 
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
          router.dispatch(req, { end : function () {
            // shouldn't ever get here
            Assert.equal(1, 0);
            done();
          }});
        }
      }
    }
  }
};