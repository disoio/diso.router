var Assert  = require('assert');
var Asserts = require('asserts');
var Url     = require('url');
var Router  = require('../');

var routes = {
  emptyRoute: '/',
  noParams: '/show',
  oneParam: '/show/:title',
  overlyComplicated : '/hello/:planet?foo=:foo&fruit=:fruit#:section',
};

var router = new Router(routes);

module.exports = {
  'diso.router formatter should': {
    'properly handle': {
      
      'empty route': function () {
        var url = router.format({
          route  : 'emptyRoute',
          params : {}
        });
        
        Assert.equal(url, '/');
      },
      
      'no param route': function () {
        var url = router.format({
          route  : 'noParams',
          params : {}
        });
        
        Assert.equal(url, '/show');
      },
      
      'one param route': function () {
        var url = router.format({
          route  : 'oneParam',
          params : {
            title : 'barf'
          }
        });
        
        Assert.equal(url, '/show/barf');
      },
      
      'overly complicated route' : function () {
        var url = router.format({
          route: 'overlyComplicated',
          params : {
            planet : 'earth',
            fruit : 'bythefoot',
            section : 'barf',
            foo : 'd'
          }
        });
        
        parsed_url = Url.parse(url, true);
        Assert.equal('/hello/earth', parsed_url.pathname);
        Assert.equal('#barf', parsed_url.hash);
        Assert.deepEqual(parsed_url.query, {
          foo   : 'd',
          fruit :'bythefoot'
        });
      },
      'extra params by adding them to the query' : function () {
        var url = router.format({
          route: 'overlyComplicated',
          params : {
            planet : 'earth',
            foo : 'd',
            barf : 'b',
            fruit : 'bythefoot',
            section : 'barf'
          }
        });
        
        parsed_url = Url.parse(url, true);
        Assert.equal('/hello/earth', parsed_url.pathname);
        Assert.equal('#barf', parsed_url.hash);
        Assert.deepEqual(parsed_url.query, {
          foo   : 'd',
          fruit :'bythefoot',
          barf  : 'b'
        });
      }
    },
    'throw error on' : {
      'missing route' : function () {
        Assert.throws(function () {
          var url = router.format({
            route : 'barf',
            params : {}
          });
        }, /No route named barf/);
      },
      'missing param' : function () {
        Assert.throws(function () {
          var url = router.format({
            route: 'oneParam',
            params : {
              barf : 'barf'
            }
          })
        }, /oneParam is missing expected param title/);
      }
    }
  }
}