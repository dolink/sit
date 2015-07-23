"use strict";

module.exports = function MusherFactory($logs, $options) {
  var musher = require('musher');
  var log = $logs.get('facet:musher');
  var options = $options[MusherFactory.instanceName];
  log.debug('using options: %j', options);
  return musher.connect(options);
};
