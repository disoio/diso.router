var Assert = require('assert');
var Asserts = require('asserts');
var Connect = require('connect');
var SuperTest = require('supertest');

var Router = require('../');

var routes = {
  show: 'GET /show/:title',
  home: '/'
};

var end = function (req, res, next) { next(); };
var handler = {
  show: end,
  home: end
};

var router = new Router();
router.delegate(routes, handler);

var app = Connect();
app
  .use(router)
  .use(function (req, res, next) {
    res.end((req.params.title || '') + req.params.action);
  });

var super_test = SuperTest(app);

function supertestEnd (done) {
  return function (err, res) {
    if (err) {
      throw(err);
    }
    done();
  }
}

module.exports = {
  'diso.router using middleware should properly handle': {
    'basic request': function (done) {
      super_test
        .get('/')
        .expect('home')
        .end(supertestEnd(done));
    },
    
    'GET request': function (done) {
      super_test
        .get('/show/barf')
        .expect('barfshow')
        .end(supertestEnd(done));
    },
    
    'unmatched route by': {
      'rendering 404 text when notFound is not set': function (done) {
        super_test
          .get('/heyheyhey')
          .expect(/Error: 404 Not Found\./)
          .expect(404)
          .end(supertestEnd(done));
      },
      
      'calling notFound when it is set': function (done) {
        var ohno = 'ohnoohno';
        router.notFound(function (req, res, next) {
          res.writeHead(404);
          res.end(ohno);
        });
        
        super_test
          .get('/heyheyhey')
          .expect(ohno)
          .expect(404)
          .end(supertestEnd(function () {
            done();
            // wtf why does SuperTest stay open
            // maybe issue with Asserts holding process.stdout open?
            process.exit(0);
          }));
      }
    }
  }
};

