"use strict";

var t = require('chai').assert;
var sit = require('../../');

describe('facets/kvstore', function () {

  describe('memory adapter', function () {
    it('should setup kvstore', function () {
      var container = sit.container({
        store: sit.facets.kvstore()
      });
      var store = container.get('store');
      t.ok(store);
      t.equal(store.name, 'memory');
    });
  });

  describe('redis adapter', function () {
    it('should setup kvstore with redis adapter', function (done) { // start redis server and remove .skip
      var container = sit.container({
        store: sit.facets.kvstore()
      }, {
        store: {
          adapter: 'redis'
        }
      });
      var store = container.get('store');
      t.ok(store);
      t.equal(store.name, 'redis');
      store.ready(done);
    });

    it('should setup kvstore with promise connected', function (done) {
      var container = sit.container({
        store: sit.facets.kvstore()
      }, {
        store: {
          adapter: 'redis'
        }
      });
      var store = container.get('store');
      t.ok(store);
      t.equal(store.name, 'redis');
      store.$promise.then(done);
    });
  });
});
