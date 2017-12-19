"use strict";

var t = require('chai').assert;
var s = require('../support');
var sit = require('../..');

describe('facets/musher', function () {
  before(s.abStartMosca());
  after(s.abStopMosca());

  it('should setup musher', function (done) { // start mqtt server (mosca), and remove .skip
    var container = sit.container({
      bus: sit.facets.musher()
    }, {
      bus: {
        host: 'localhost',
        port: s.port
      }
    });

    var socket = container.get('bus');
    t.ok(socket);
    t.isFunction(socket.ready);
    socket.ready(() => socket.close(done));
  });

  it('should setup musher with promise connected', function (done) { // start mqtt server (mosca), and remove .skip
    var container = sit.container({
      bus: sit.facets.musher()
    }, {
      bus: {
        host: 'localhost',
        port: s.port
      }
    });

    var socket = container.get('bus');
    t.ok(socket);
    t.isFunction(socket.ready);
    socket.$promise.then(() => socket.close(done));
  });
});
