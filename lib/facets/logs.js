"use strict";

var _ = require('lodash');

module.exports = function () {
  return LogsFacet;
};

function LogsFacet($options) {
  var logs = require('logs');

  var options = _.assign({level: 'debug'}, $options[LogsFacet.facetname]);
  var adapter = options.adapter || options.library || 'winston';
  logs.use(adapter, options);
  return logs;
}
