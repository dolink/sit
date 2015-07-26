"use strict";

var di = require('dicon');
var _ = require('lodash');
var logs = require('./facets/logs');
var settings = require('./settings');

module.exports = function container(facets, options) {
  options = _.defaults(options, settings.defaults);
  var m = {
    $options: ['value', options || {}],
    $logs: ['factory', logs()]
  };

  _.forEach(facets, function (facet, name) {
    m[name] = Array.isArray(facet) ? facet : [typeof facet === 'function' ? 'factory' : 'value', facet];
  });

  _.forEach(m, function (def, name) {
    if (def[0] === 'factory') {
      def[1].facetname = def[1].instname = name;
    }
  });

  var container = new di.Container(m);
  container.run = container.invoke;
  return container;
};
