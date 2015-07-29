"use strict";

var _ = require('lodash');
var amqper = require('amqper');

module.exports = function () {
  return function AMQPFacet($options) {
    var options = _.assign({}, $options[AMQPFacet.facetname]);
    return amqper.connect(options);
  }
};
