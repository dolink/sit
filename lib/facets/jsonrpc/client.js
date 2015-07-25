"use strict";

var debug = require('debug')('sit:jsonrpc:client');
var when = require('when');
var jayson = require('jayson');
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
    this._setup();
  }

  Client.prototype._setup = function () {
    var that = this;

    var port = that.options.port;
    if (!port) {
      throw new Error('JSON RPC Client requires `port` settings');
    }

    var hostname = that.options.host || that.options.hostname;
    if (!hostname) {
      throw new Error('JSON RPC Client requires `host` settings');
    }

    var settings = {hostname: hostname, port: port};
    this.log.debug('Configuration for JSON RPC Client: %j', settings);
    this.client = jayson.client.http(settings);
    this.signer = signing.signer(that.options.signing);
  };

  Client.prototype.request = function(method) {
    var that = this;
    var log = this.log;
    var remoteMethod = this.options.methodPrefix + method;
    var remoteArgs = [].slice.apply(arguments).slice(1);

    return when.try(function() {
      var deferred = when.defer();

      log.debug('call', method, remoteArgs);

      if (that.signer) {
        var signedArgs = that.signer.sign({method: remoteMethod, args: remoteArgs});
        remoteArgs = [signedArgs];

        log.debug('signed', method, remoteArgs);
      }

      that.client.request(remoteMethod, remoteArgs, function(err, value) {
        log.debug('result:', err, value && value.error ? value.error : "-", value && value.result ? value.result : "-");

        if (err) {
          log.debug('call', 'rejecting with call error');
          deferred.reject(err);
        } else if (value.error) {
          log.debug('call', 'rejecting remote error');
          deferred.reject(value.error);
        } else {
          deferred.resolve(value.result);
        }
      });

      return deferred.promise;
    });
  };

  return Client;
};
