"use strict";

var t = require('chai').assert;
var sit = require('../../');
var request = require('supertest');

var car = require('../mocks/car');

describe('facets/jsonrpc/server', function () {

  it('should setup methods', function (done) {
    var injector = sit.injector({
      car: car,
      server: sit.facets.jsonrpc.server('car')
    }, {
      server: {
        signing: {
          sign: true,
          secret: 'secret007'
        }
      }
    });

    var server = injector.get('server');
    t.ok(server.methods);
    t.isFunction((server.methods['car.start']));
    server.$promise.then(function () {
      server.httpServer.close(done);
    });
  });

  it('should listen', function (done) {
    var injector = sit.injector({
      car: car,
      server: sit.facets.jsonrpc.server('car')
    }, {
      server: {
        signing: {
          sign: true,
          secret: 'secret007'
        }
      }
    });

    var server = injector.get('server');
    server.$promise.then(function (app) {
      request(app)
        .get('/status')
        .expect(200)
        .expect({status: 'ok'})
        .end(function (err) {
          if (err) throw err;
          server.httpServer.close(done);
        });
    });
  });
});
