"use strict";

module.exports = function () {
  return LogsFacet;
};

function LogsFacet($options) {
  var logs = require('logs');

  var options = $options[LogsFacet.facetname] || {};
  var adapter = options.adapter || options.library || 'log4js';
  logs.use(adapter, options);
  return logs;
};
