"use strict";

var when = require('when');
var jwt = require('jsonwebtoken');

module.exports = function (options) {
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
      var deferred = when.defer();

      jwt.verify(encoded, options.secret, function(err, decoded) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(decoded);
        }
      });

      return deferred.promise;
    }
  };
};
