'use strict';

var _ = require('lodash');

module.exports = function () {
  return MetricsFacet;
};

/**
 *
 * For detail usage: https://github.com/msiebuhr/node-statsd-client
 *
 * Global options:
 * prefix: Prefix all stats with this value (default "").
 * debug: Print what is being sent to stderr (default false).
 * tcp: User specifically wants to use tcp (default false).
 * socketTimeout: Dual-use timer. Will flush metrics every interval. For UDP, it auto-closes the socket after this long without activity (default 1000 ms; 0 disables this). For TCP, it auto-closes the socket after socketTimeoutsToClose number of timeouts have elapsed without activity.
 *
 * UDP options:
 * host: Where to send the stats (default localhost).
 * port: Port to contact the statsd-daemon on (default 8125).
 *
 * TCP options:
 * host: Where to send the stats (default localhost).
 * port: Port to contact the statsd-daemon on (default 8125).
 * socketTimeoutsToClose: Number of timeouts in which the socket auto-closes if it has been inactive. (default 10; 1 to auto-close after a single timeout).
 *
 * HTTP options:
 * host: The URL to send metrics to (default: http://localhost).
 * headers: Additional headers to send (default {})
 * method: What HTTP method to use (default PUT)
 *
 * @param $logs
 * @param $options
 * @returns {*}
 * @constructor
 */
function MetricsFacet($logs, $options) {
  var Client = require('statsd-client');
  var facetname = MetricsFacet.facetname;
  var log = $logs.get('sit:metrics#' + facetname);

  var options = _.defaults($options[facetname], {host: 'localhost'});
  var client = new Client(options);

  log.info('statsd client initialized with options', options);

  return client;
}
