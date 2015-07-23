'use strict';

var t = require('chai').assert;
var sit = require('../');

describe('sit', function () {
  it('should access builtin $options facet', function () {
    var injector = sit.injector({
      foo: function ($options) {
        return $options.foo;
      }
    }, {foo: 'bar'});

    t.equal(injector.get('foo'), 'bar');
  });

  it('should access builtin $logs facet', function () {
    var injector = sit.injector();
    t.ok(injector.get('$logs'));
  });

  it('should setup kvstore', function () {
    var injector = sit.injector({
      store: sit.facets.kvstore
    });
    var store = injector.get('store');
    t.ok(store);
    t.equal(store.name, 'memory');
  });

  it('should setup kvstore with redis adapter', function (done) {
    var injector = sit.injector({
      store: sit.facets.kvstore
    }, {
      store: {
        adapter: 'redis'
      }
    });
    var store = injector.get('store');
    t.ok(store);
    t.equal(store.name, 'redis');
    store.ready(done);
  });

  it('should throw error with full path if no provider', function () {
    var injector = sit.injector({
      a: function (b) {
        return 'a-value';
      },
      b: function (c) {
        return 'b-value';
      }
    });

    t.throw(function () {
      injector.get('a');
    }, 'No provider for "c"! (Resolving: a -> b -> c)');
  });


});
