'use strict';

var t = require('chai').assert;
var sit = require('../../');

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

    var container, metrics;
    before(function () {
      container = sit.container({
        metrics: sit.facets.metrics()
      }, {
        metrics: {
          debug: true
        }
      });

      metrics = container.get('metrics');
    });

    after(function () {
      metrics.close();
    });

    it('should count', function () {
      metrics.increment('foo', 1);
    });
  });


});
