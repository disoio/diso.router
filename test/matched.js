var Assert  = require('assert');
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
  'MatchedRoute path method should': {
    'properly handle': {
      'matched path route': function () {
        var original = '/show/derp';
        var path = router.match({
          path : original
        }).path();

        Assert.equal(path, original);
      },

      'empty route': function () {
        var path = router.match({ 
          route : {
            name   : 'emptyRoute',
            params : {}
          }
        }).path();
        
        Assert.equal(path, '/');
      },
      
      'no param route': function () {
        var path = router.match({
          route : {
            name   : 'noParams',
            params : {}
          }
        }).path();
        
        Assert.equal(path, '/show');
      },
      
      'one param route': function () {
        var path = router.match({
          route : {
            name   : 'oneParam',
            params : {
              title : 'barf'
            }
          }
        }).path();
        
        Assert.equal(path, '/show/barf');
      },

      'overly complicated route' : function () {
        var path = router.match({
          route : {
            name   : 'overlyComplicated',
            params : {
              planet  : 'earth',
              fruit   : 'bythefoot',
              section : 'barf',
              foo     : 'd'
            }
          }
        }).path();
        
        parsed = Url.parse(path, true);
        Assert.equal(parsed.pathname, '/hello/earth');
        Assert.equal(parsed.hash, '#barf');
        Assert.deepEqual(parsed.query, {
          foo   : 'd',
          fruit :'bythefoot'
        });
      },

      'extra params by adding them to the query' : function () {
        var path = router.match({
          route : {
            name   : 'overlyComplicated',
            params : {
              planet  : 'earth',
              foo     : 'd',
              barf    : 'b',
              fruit   : 'bythefoot',
              section : 'barf'
            }
          }
        }).path();
        
        parsed = Url.parse(path, true);
        Assert.equal(parsed.pathname, '/hello/earth');
        Assert.equal(parsed.hash, '#barf');
        Assert.deepEqual(parsed.query, {
          foo   : 'd',
          fruit : 'bythefoot',
          barf  : 'b'
        });
      }
    },

    'missing route' : function () {
      var path = router.match({
        route : {
          name   : 'barf',
          params : {}
        }
      }).path();

      Assert.equal(path, '/404');
    },

    'missing param' : function () {
      var path = router.match({
        route : {
          name   : 'oneParam',
          params : {
            barf : 'barf'
          }
        }
      }).path();

      Assert.equal(path, '/404');
    }
  }
};