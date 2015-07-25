'use strict';

var settings = require('./settings');

exports.facets = require('./facets');
exports.injector = require('./injector');

Object.defineProperty(exports, 'defaults', {
  get: function () {
    return settings.defaults;
  },
  set: function (value) {
    settings.defaults = value;
  }
});
