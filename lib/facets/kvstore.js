"use strict";

var when = require('when');

module.exports = function KVStoreFactory($logs, $options) {
  var kvs = require('kvs');
  var instname = KVStoreFactory.instname;
  var log = $logs.get('facet:kvstore#' + instname);
  var options = $options[instname] || {};
  var adapter = options.adapter || 'memory';
  var store = kvs.store(adapter, options);

  store.on('ready', function () {
    log.info('#%s connected', instname);
  });

  store.$promise = when.promise(function (resolve) {
    store.ready(resolve);
  });
  return store;
};
