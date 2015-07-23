"use strict";

module.exports = function KVStoreFactory($options) {
  var kvs = require('kvs');

  var options = $options[KVStoreFactory.instname] || {};
  var adapter = options.adapter || 'memory';
  return kvs.store(adapter, options);
};
