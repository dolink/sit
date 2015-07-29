"use strict";

var _ = require('lodash');
var amqper = require('amqper');

module.exports = function () {
  return function AMQPFacet($logs, $options) {
    var log = $logs.get('sit:amqp');
    var options = _.assign({}, $options[AMQPFacet.facetname]);

    var client = amqper.connect(options);
    client.$promise.then(function () {
      log.info('connected using options', options);
    });
    return client;
  }
};
