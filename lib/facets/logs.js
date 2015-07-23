"use strict";

module.exports = function LogsFactory($options) {
  var logs = require('logs');

  var options = $options[LogsFactory.instanceName] || {};
  var adapter = options.adapter || options.library || 'log4js';
  logs.use(adapter, options);
  return logs;
};
