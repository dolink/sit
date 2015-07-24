"use strict";

var debug = require('debug')('sit:jsonrpc:server');
var when = require('when');
var jayson = require('jayson');
var flat = require('flat');
var _ = require('lodash');
var signing = require('./signing');

var express = require('express');
var bodyParser = require('body-parser');

module.exports = function (exposes) {

  function ServerFacet($options, injector) {
    if (!(this instanceof ServerFacet)) {
      return new ServerFacet($options, injector);
    }

    this.name = ServerFacet.facetname;
    this.injector = injector;

    this.options = _.assign({
      port: 6100,
      host: '127.0.0.1'
    }, $options[ServerFacet.facetname]);

    this._setup();
  }

  ServerFacet.prototype._setup = function () {
    this._setupMethods();
    this.$promise = this._setupServer();
  };

  ServerFacet.prototype._setupMethods = function () {
    var methods = this.methods = [];
    var injector = this.injector;
    if (!Array.isArray(exposes)) exposes = [exposes];
    _.forEach(exposes, function (facetname) {
      var facet = injector.get(facetname);
      var flattened = flat.flatten(facet);
      _.forEach(flattened, function (method, name) {
        // skip private function and value fields
        if (name[0] === '_' || typeof method !== 'function') return;
        methods[facetname + '.' + name] =  method.bind(facet);
      })
    });
    debug('export', this.methods);
  };

  ServerFacet.prototype._setupServer = function () {
    var that = this;
    return when.try(function () {
      var host = that.options.host;
      var port = that.options.port;

      if (!port) {
        throw new Error('JSON RPC requires `port`');
      }

      var signer = signing(that.options.signing);

      var wrappedMethods = {};
      for (var name in that.methods) {
        if (!that.methods.hasOwnProperty(name)) continue;
        var method = that.methods[name];

        (function (name, method) {
          wrappedMethods[name] = function () {
            var args = [].slice.apply(arguments);
            var callback = args.pop();

            debug('call', args);

            var argsPromise;

            if (signer) {
              // ensure that we have an argument and that it is a string
              var encoded = args[0];
              if (typeof encoded !== 'string') {
                encoded = '';
              }

              // decode and check JWT signature
              argsPromise = signer.verify(encoded).then(function (decoded) {
                if (decoded.method != name) {
                  throw {code: 403, message: 'Method name mismatch during signature verification'};
                }
                debug('verified', decoded.method, decoded.args);
                return decoded.args;
              }, function () {
                throw {code: 403, message: 'Verification of signed message failed'};
              });
            } else {
              // not using JWT signing, allow plaintext RPC
              argsPromise = when(args);
            }

            // promisify the maybe-promise result
            var promise = argsPromise.then(function (args) {
              return when.try(function () {
                return method.apply(undefined, args);
              });
            });

            // wrap back out to node callback style
            promise.done(function (val) {
              debug('result', val);
              callback(null, val);
            }, function (err) {
              debug('error', err.stack);
              // must be the correct format, check for node Errors and
              // magicify into {code: ..., message: ...}
              if (err.hasOwnProperty('message')) {
                callback(err);
              } else {
                callback({message: err.toString()});
              }
            });
          };
        })(name, method);
      }

      var server = that.server = jayson.server(wrappedMethods);

      var app = that.app = express();

      var deferred = when.defer();

      app.use(bodyParser.json());

      app.get('/status', function (req, res) {
        res.status(200).send({status: 'ok'});
      });

      app.use(server.middleware());

      that.httpServer = app.listen(port, host, function () {
        debug(that.name, 'Listening on', host + ':' + port);
        deferred.resolve(app);
      });

      return deferred.promise;
    });
  };

  return ServerFacet;
};

