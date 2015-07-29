"use strict";

var when = require('when');

module.exports = function () {
  return KVStoreFacet;
};

function KVStoreFacet($logs, $options) {
  var kvs = require('kvs');
  var facetname = KVStoreFacet.facetname;
  var log = $logs.get('sit:kvstore#' + facetname);
  var options = $options[facetname] || {};
  var adapter = options.adapter || 'memory';
  var store = kvs.store(adapter, options);

  var settings = store.settings;
  store.on('ready', function () {
    log.info('connected to %s://%s', options.adapter, options.adapter === 'memory' ? 'memory' : settings.host + ':' + settings.port);
  });

  store.$promise = when.promise(function (resolve) {
    store.ready(resolve);
  });
  return store;
}
