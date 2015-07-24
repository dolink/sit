'use strict';

var t = require('chai').assert;
var sit = require('../');

describe('sit', function () {

  describe('injector', function () {
    it('should accept value facet', function () {
      var injector = sit.injector({
        foo: ['value', 100]
      });

      t.equal(injector.get('foo'), 100);
    });

    it('should get injector self', function () {
      var injector = sit.injector();
      injector.invoke(function (injector) {
        t.ok(injector);
        t.isFunction(injector.invoke)
      });
    });

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

    it('should init eagerly by run', function (done) {
      var hello;
      var injector = sit.injector({
        foo: function () {
          hello = 'world';
        }
      });

      injector.run(function (foo) {
        t.equal(hello, 'world');
        done();
      });
    });
  });

  describe('facets/kvstore', function () {

    describe('memory adapter', function () {
      it('should setup kvstore', function () {
        var injector = sit.injector({
          store: sit.facets.kvstore
        });
        var store = injector.get('store');
        t.ok(store);
        t.equal(store.name, 'memory');
      });
    });

    describe('redis adapter', function () {
      it('should setup kvstore with redis adapter', function (done) { // start redis server and remove .skip
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

      it('should setup kvstore with promise connected', function (done) {
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
        store.$promise.then(done);
      });
    });
  });

  describe('facets/musher', function () {
    it('should setup musher', function (done) { // start mqtt server (mosca), and remove .skip
      var injector = sit.injector({
        bus: sit.facets.musher
      }, {
        bus: {
          host: 'localhost'
        }
      });

      var socket = injector.get('bus');
      t.ok(socket);
      t.isFunction(socket.ready);
      socket.ready(done);
    });

    it('should setup musher with promise connected', function (done) { // start mqtt server (mosca), and remove .skip
      var injector = sit.injector({
        bus: sit.facets.musher
      }, {
        bus: {
          host: 'localhost'
        }
      });

      var socket = injector.get('bus');
      t.ok(socket);
      t.isFunction(socket.ready);
      socket.$promise.then(done);
    });
  });

});
