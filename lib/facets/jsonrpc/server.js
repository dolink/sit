"use strict";

var debug = require('debug')('sit:jsonrpc:server');
var when = require('when');
var rayson = require('rayson');
var flat = require('flat');
var _ = require('lodash');
var signing = require('./signing');

var express = require('express');
var bodyParser = require('body-parser');

module.exports = function (exposes, app) {

  var owned = !app; // owned app and server ?

  function ServerFacet($logs, $options, container) {
    if (!(this instanceof ServerFacet)) {
      return new ServerFacet($logs, $options, container);
    }

    this.name = ServerFacet.facetname;
    this.container = container;
    this.log = $logs.get('sit:jsonrpc:server#' + this.name);

    this.options = _.assign({}, $options[ServerFacet.facetname]);

    this._init();
  }

  ServerFacet.prototype._init = function () {
    this._setupMethods();
    this.$promise = this._setupServer();
  };

  ServerFacet.prototype._setupMethods = function () {
    var methods = this.methods = {};
    var container = this.container;
    if (!Array.isArray(exposes)) exposes = [exposes];
    _.forEach(exposes, function (facetname) {
      var facet = container.get(facetname);
      var flattened = flat.flatten(facet);
      _.forEach(flattened, function (method, name) {
        // skip private function and value fields
        if (name[0] === '_' || typeof method !== 'function') return;
        methods[facetname + '.' + name] =  method.bind(facet);
      })
    });
    this.log.debug('export', Object.keys(methods));
  };

  ServerFacet.prototype._setupServer = function () {
    var that = this;
    var options = this.options;
    var log = this.log;
    return when.try(function () {
      var signer = signing.signer(that.options.signing);

      var wrappedMethods = {};
      for (var name in that.methods) {
        if (!that.methods.hasOwnProperty(name)) continue;
        var method = that.methods[name];

        (function (name, method) {
          wrappedMethods[name] = function () {
            var args = [].slice.apply(arguments);
            var callback = args.pop();

            log.debug('call', args);

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
                log.debug('verified', decoded.method, decoded.args);
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
              log.debug('result', val);
              callback(null, val);
            }, function (err) {
              log.debug('error', err.stack);
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

      var server = that.server = rayson.server(wrappedMethods);
      var deferred = when.defer();

      var protocol = options.protocol || 'http';

      if (protocol === 'http') {
        app = app || express();

        if (owned) {
          app.use(bodyParser.json());
          app.get('/status', function (req, res) {
            res.status(200).send({status: 'ok'});
          });
        }

        if (app.middleware) {
          app.middleware('routes:before', server.middleware());
        } else {
          app.use(server.middleware());
        }

        if (owned) {
          var host = options.host;
          var port = options.port;

          if (!port && owned) {
            throw new Error('JSON RPC requires `port` settings');
          }

          that.server = app.listen(port, host, function () {
            log.info('Listening on http://%s:%d', host, port);
            log.info('Vew status on http://%s:%d/status', host, port);
            deferred.resolve(app);
          });
        } else {
          deferred.resolve(app);
        }
      } else { // other server like `mqtt`
        that.server = server[protocol](options);
        if (that.server.ready) {
          that.server.ready(function () {
            deferred.resolve(that.server);
          })
        } else {
          deferred.resolve(that.server);
        }
      }

      return deferred.promise;
    });
  };

  ServerFacet.prototype.request = function(method) {
    var remoteArgs = [].slice.apply(arguments).slice(1);
    return this.methods[method].apply(undefined, remoteArgs);
  };

  return ServerFacet;
};




