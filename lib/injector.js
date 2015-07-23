"use strict";

var di = require('di');
var _ = require('lodash');
var logs = require('./facets/logs');

module.exports = function injector(facets, options) {
  var m = {
    $options: ['value', options || {}],
    $logs: ['factory', logs]
  };

  _.forEach(facets, function (facet, name) {
    m[name] = Array.isArray(facet) ? facet : [typeof facet === 'function' ? 'factory' : 'value', facet];
  });

  _.forEach(m, function (def, name) {
    if (def[0] === 'factory') {
      def[1].instanceName = name;
    }
  });

  return new di.Injector(m);
};
