"use strict";

var when = require('when');

module.exports = function KVStoreFactory($options) {
  var kvs = require('kvs');
  var options = $options[KVStoreFactory.instname] || {};
  var adapter = options.adapter || 'memory';
  var store = kvs.store(adapter, options);
  store.$promise = when.promise(function (resolve) {
    store.ready(resolve);
  });
  return store;
};
