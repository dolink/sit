'use strict';

var t = require('chai').assert;
var sit = require('../../');
var FakeServer = require('../fake-server');

describe('facets/metrics', function () {

  it('should initialize statsd client', function () {
    var container = sit.container({
      metrics: sit.facets.metrics()
    });
    var metrics = container.get('metrics');
    t.ok(metrics);
    metrics.close();
  });

  describe('operations', function () {

    var container, metrics, s;
    before(function (done) {
      container = sit.container({
        metrics: sit.facets.metrics()
      }, {
        metrics: {
          debug: true
        }
      });

      metrics = container.get('metrics');
      s = new FakeServer();
      s.start(done);
    });

    after(function () {
      metrics.close();
      s.stop();
    });

    it('should count', function (done) {
      metrics.increment('test.foo', 1);
      metrics.gauge('test.gauge', 10);
      s.expectMessage('test.foo:1|c', done);
    });
  });


});
