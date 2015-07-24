"use strict";

var when = require('when');

module.exports = function () {
  return KVStoreFacet;
};

function KVStoreFacet($logs, $options) {
  var kvs = require('kvs');
  var facetname = KVStoreFacet.facetname;
  var log = $logs.get('facet:kvstore#' + facetname);
  var options = $options[facetname] || {};
  var adapter = options.adapter || 'memory';
  var store = kvs.store(adapter, options);

  store.on('ready', function () {
    log.info('#%s connected', facetname);
  });

  store.$promise = when.promise(function (resolve) {
    store.ready(resolve);
  });
  return store;
}
