"use strict";

var t = require('chai').assert;
var PromiseA = require('bluebird');
var findPort = require('find-port');
var request = require('supertest');
var s = require('../support');
var sit = require('../../');

var car = {
  name: 'Tesla',
  start: function () {
    console.log('start');
  },
  _private_method: function () {

  }
};

describe('facets/jsonrpc', function () {

  var port;
  before(function (done) {
    findPort('127.0.0.1', [10000, 10010], function (ports) {
      port = ports[0];
      done();
    });
  });


  describe('server', function () {
    it('should setup methods', function (done) {
      var container = sit.container({
        car: car,
        server: sit.facets.jsonrpc.server('car')
      }, {
        server: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });

      var server = container.get('server');
      t.ok(server.methods);
      t.isFunction((server.methods['car.start']));
      t.notOk(server.methods._private_method);
      t.notOk(server.methods.name);
      server.$promise.finally(function () {
        server.server.close(done);
      });
    });

    it('should listen', function (done) {
      var container = sit.container({
        car: car,
        server: sit.facets.jsonrpc.server('car')
      }, {
        server: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });

      var server = container.get('server');
      server.$promise.then(function (app) {
        request(app)
          .get('/status')
          .expect(200)
          .expect({status: 'ok'})
          .end(function (err) {
            if (err) throw err;
            server.server.close(done);
          });
      });
    });
  });

  describe('client', function () {
    it('should setup client', function () {
      var container = sit.container({
        client: sit.facets.jsonrpc.client()
      }, {
        client: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });
      var client = container.get('client');
      t.ok(client.client);
    });
  });

  describe('integration', function () {
    it('should execute for client request with sign', function (done) {
      var answer;
      var foo = {
        bar: function (msg) {
          answer = msg;
          return 'pong';
        }
      };

      var serverContainer = sit.container({
        foo: foo,
        server: sit.facets.jsonrpc.server('foo')
      }, {
        server: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });
      var server = serverContainer.get('server');

      var clientContainer = sit.container({
        foo: sit.facets.jsonrpc.client()
      }, {
        foo: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });
      var fooClient = clientContainer.get('foo');

      var error;
      server.$promise.then(function () {
        fooClient.request('bar', 'ping').then(function (response) {
          t.equal(answer, 'ping');
          t.equal(response, 'pong');
        }, function (err) {
          error = err;
        }).finally(function () {
          server.server.close(function () {
            done(error);
          });
        });
      });
    });

    it('should execute for client request without sign', function (done) {
      var answer;
      var foo = {
        bar: function (msg) {
          answer = msg;
          return 'pong';
        }
      };

      var serverContainer = sit.container({
        foo: foo,
        server: sit.facets.jsonrpc.server('foo')
      }, {
        server: {
          host: 'localhost',
          port: port,
          signing: {
            sign: false
          }
        }
      });
      var server = serverContainer.get('server');

      var clientContainer = sit.container({
        foo: sit.facets.jsonrpc.client()
      }, {
        foo: {
          host: 'localhost',
          port: port,
          signing: {
            sign: false
          }
        }
      });
      var fooClient = clientContainer.get('foo');

      server.$promise.then(function () {
        fooClient.request('bar', 'ping').then(function (response) {
          t.equal(answer, 'ping');
        }).finally(function () {
          server.server.close(done);
        });
      });
    });

    it('should return error if signing not matching', function (done) {
      var answer;
      var foo = {
        bar: function (msg) {
          answer = msg;
          return 'pong';
        }
      };

      var serverContainer = sit.container({
        foo: foo,
        server: sit.facets.jsonrpc.server('foo')
      }, {
        server: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });
      var server = serverContainer.get('server');

      var clientContainer = sit.container({
        foo: sit.facets.jsonrpc.client()
      }, {
        foo: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret008'
          }
        }
      });
      var fooClient = clientContainer.get('foo');

      server.$promise.then(function () {
        fooClient.request('bar', 'ping').then(function () {
          t.fail('should not run here');
        }).catch(function (err) {
          t.ok(err);
          t.equal(err.code, 403);
          t.equal(err.message, 'Verification of signed message failed');
        }).finally(function () {
          server.server.close(done);
        });
      });
    });
  });

  describe('protocol/mqtt', function () {

    before(s.abStartMosca());
    after(s.abStopMosca());

    it('should work with mqtt protocol', function (done) {
      var answer;
      var foo = {
        bar: function (msg) {
          answer = msg;
          return 'pong';
        }
      };

      var serverContainer = sit.container({
        foo: foo,
        server: sit.facets.jsonrpc.server('foo')
      }, {
        server: {
          protocol: 'mqtt',
          port: s.port,
          topic: '$rpc',
          signing: {
            sign: false
          }
        }
      });
      var server = serverContainer.get('server');

      var clientContainer = sit.container({
        foo: sit.facets.jsonrpc.client()
      }, {
        foo: {
          protocol: 'mqtt',
          port: s.port,
          topic: '$rpc',
          signing: {
            sign: false
          }
        }
      });
      var fooClient = clientContainer.get('foo');

      server.$promise.then(function () {
        fooClient.request('bar', 'ping').then(function (response) {
          t.equal(answer, 'ping');
        }).finally(function () {
          server.server.close(done);
        });
      });
    });
  });

  describe('parallels', function () {
    it('should execute in paralleling', function (done) {
      var foo = {
        bar: function (msg) {
          return msg;
        }
      };

      var serverContainer = sit.container({
        foo: foo,
        server: sit.facets.jsonrpc.server('foo')
      }, {
        server: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });
      var server = serverContainer.get('server');

      var clientContainer = sit.container({
        foo: sit.facets.jsonrpc.client()
      }, {
        foo: {
          host: 'localhost',
          port: port,
          signing: {
            sign: true,
            secret: 'secret007'
          }
        }
      });
      var fooClient = clientContainer.get('foo');

      var arr = [];
      for (var i = 1; i < 21; i++) {
        arr.push(i);
      }

      server.$promise.then(function () {
        PromiseA.map(arr, function (item) {
          return fooClient.request('bar', item).then(function (response) {
            t.equal(response, item);
          });
        }).finally(function () {
          server.server.close(done);
        });
      });
    });
  });

});
