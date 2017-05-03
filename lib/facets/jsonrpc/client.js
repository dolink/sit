"use strict";

var debug = require('debug')('sit:jsonrpc:client');
var PromiseA = require('bluebird');
var rayson = require('rayson');
var _ = require('lodash');
var signing = require('./signing');

module.exports = function () {

  function Client($logs, $options) {
    if (!(this instanceof Client)) {
      return new Client($logs, $options);
    }

    this.name = Client.facetname;
    this.options = _.assign({}, $options[this.name]);
    this.options.methodPrefix = this.options.methodPrefix || (this.name + '.');
    this.log = $logs.get('sit:jsonrpc:client#' + this.name);
    this._init();
  }

  Client.prototype._init = function () {
    var that = this;

    var options = this.options;
    options.hostname = options.hostname || options.host;

    this.log.debug('Configuration for JSON RPC Client: %j', options);
    this.client = rayson.client[options.protocol || 'http'](options);
    this.signer = signing.signer(that.options.signing);
  };

  Client.prototype.request = function(method) {
    var that = this;
    var log = this.log;
    var remoteMethod = this.options.methodPrefix + method;
    var remoteArgs = [].slice.apply(arguments).slice(1);

    return new PromiseA(function(resolve, reject) {
      log.debug('call', method, remoteArgs);

      if (that.signer) {
        var signedArgs = that.signer.sign({method: remoteMethod, args: remoteArgs});
        remoteArgs = [signedArgs];

        log.debug('signed', method, remoteArgs);
      }

      var request = that.client.request(remoteMethod, remoteArgs, function(err, value) {
        log.debug('result:', err, value && value.error ? value.error : "-", value && value.result ? value.result : "-");

        if (err) {
          log.debug('call', 'rejecting with call error');
          reject(err);
        } else if (value.error) {
          log.debug('call', 'rejecting remote error');
          reject(value.error);
        } else {
          resolve(value.result);
        }
      });

      if (request.timeout) {
        request.timeout(10000); // default timed out after 10s
      }
    });
  };

  return Client;
};
