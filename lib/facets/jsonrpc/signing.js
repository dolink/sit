"use strict";

var PromiseA = require('bluebird');
var jwt = require('jsonwebtoken');

exports.signer = function (options) {
  if (!options) {
    throw new Error('JSON RPC requires `signing` options');
  }

  if (!options.hasOwnProperty('sign')) {
    throw new Error('JSON RPC requires explicit selection of signing, to disable use {sign: false}');
  }

  if (!options.sign) {
    return null;
  }

  return {
    sign: function(payload) {
      return jwt.sign(payload, options.secret);
    },
    verify: function(encoded) {
      return PromiseA.fromCallback(cb => jwt.verify(encoded, options.secret, cb));
    }
  };
};
