"use strict";

var t = require('chai').assert;
var sit = require('../../');

describe('facets/musher', function () {
  it('should setup musher', function (done) { // start mqtt server (mosca), and remove .skip
    var container = sit.container({
      bus: sit.facets.musher()
    }, {
      bus: {
        host: 'localhost'
      }
    });

    var socket = container.get('bus');
    t.ok(socket);
    t.isFunction(socket.ready);
    socket.ready(done);
  });

  it('should setup musher with promise connected', function (done) { // start mqtt server (mosca), and remove .skip
    var container = sit.container({
      bus: sit.facets.musher()
    }, {
      bus: {
        host: 'localhost'
      }
    });

    var socket = container.get('bus');
    t.ok(socket);
    t.isFunction(socket.ready);
    socket.$promise.then(done);
  });
});
