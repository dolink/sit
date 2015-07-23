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

  it.skip('should setup kvstore with redis adapter', function (done) { // start redis server and remove .skip
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

  it.skip('should setup musher', function (done) { // start mqtt server (mosca), and remove .skip
    var injector = sit.injector({
      socket: sit.facets.musher
    }, {
      socket: {
        host: 'localhost'
      }
    });

    var socket = injector.get('socket');
    t.ok(socket);
    t.isFunction(socket.ready);
    socket.ready(done);
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
