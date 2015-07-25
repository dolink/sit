"use strict";

var t = require('chai').assert;
var sit = require('../../');

describe('facets/kvstore', function () {

  describe('memory adapter', function () {
    it('should setup kvstore', function () {
      var injector = sit.injector({
        store: sit.facets.kvstore()
      });
      var store = injector.get('store');
      t.ok(store);
      t.equal(store.name, 'memory');
    });
  });

  describe('redis adapter', function () {
    it('should setup kvstore with redis adapter', function (done) { // start redis server and remove .skip
      var injector = sit.injector({
        store: sit.facets.kvstore()
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
        store: sit.facets.kvstore()
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
