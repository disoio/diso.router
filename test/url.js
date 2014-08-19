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
  'MatchedRoute url method should': {
    'properly handle': {
      'matched url route': function () {
        var original = '/show/derp';
        var url = router.match({
          url : original
        }).url();

        Assert.equal(url, original);
      },

      'empty route': function () {
        var url = router.match({ 
          route : {
            name   : 'emptyRoute',
            params : {}
          }
        }).url();
        
        Assert.equal(url, '/');
      },
      
      'no param route': function () {
        var url = router.match({
          route : {
            name   : 'noParams',
            params : {}
          }
        }).url();
        
        Assert.equal(url, '/show');
      },
      
      'one param route': function () {
        var url = router.match({
          route : {
            name   : 'oneParam',
            params : {
              title : 'barf'
            }
          }
        }).url();
        
        Assert.equal(url, '/show/barf');
      },

      'overly complicated route' : function () {
        var url = router.match({
          route : {
            name   : 'overlyComplicated',
            params : {
              planet  : 'earth',
              fruit   : 'bythefoot',
              section : 'barf',
              foo     : 'd'
            }
          }
        }).url();
        
        parsed_url = Url.parse(url, true);
        Assert.equal(parsed_url.pathname, '/hello/earth');
        Assert.equal(parsed_url.hash, '#barf');
        Assert.deepEqual(parsed_url.query, {
          foo   : 'd',
          fruit :'bythefoot'
        });
      },

      'extra params by adding them to the query' : function () {
        var url = router.match({
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
        }).url();
        
        parsed_url = Url.parse(url, true);
        Assert.equal(parsed_url.pathname, '/hello/earth');
        Assert.equal(parsed_url.hash, '#barf');
        Assert.deepEqual(parsed_url.query, {
          foo   : 'd',
          fruit : 'bythefoot',
          barf  : 'b'
        });
      }
    },

    'missing route' : function () {
      var url = router.match({
        route : {
          name   : 'barf',
          params : {}
        }
      }).url();

      Assert.equal(url, '/404');
    },

    'missing param' : function () {
      var url = router.match({
        route : {
          name   : 'oneParam',
          params : {
            barf : 'barf'
          }
        }
      }).url();

      Assert.equal(url, '/404');
    }
  }
};