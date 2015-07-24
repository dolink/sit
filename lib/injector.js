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
    if (!facet) return;
    if (Array.isArray(facet)) {
      m[name] = facet;
    } else if (typeof facet === 'function') {
      m[name] = ['factory', facet];
    }
  });

  _.forEach(m, function (def, name) {
    if (def[0] === 'factory') {
      def[1].instname = name;
    }
  });

  var injector = new di.Injector(m);
  injector.run = injector.invoke;
};
