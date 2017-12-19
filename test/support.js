"use strict";

var _ = require('lodash');
var mosca = require('mosca');

var port = 6677;

Object.defineProperty(exports, 'port', {
  get: function () {
    return port;
  }
});

exports.startMosca = function (settings) {
  settings = _.assign({port: port}, settings);
  console.log();
  console.log('start mosca', settings);
  console.log();
  return new mosca.Server(settings);
};

exports.abStartMosca = function (settings) {
  return function (done) {
    this.mosca = exports.startMosca(settings);
    this.mosca.on('ready', done);
  };
};

exports.abStopMosca = function () {
  return function (done) {
    console.log();
    console.log('close mosca');
    console.log();
    if (!this.mosca) {
      done();
    }
    this.mosca.close(done);
  };
};

exports.delaycall = function (ms, cb) {
  if (typeof ms === 'function') {
    cb = ms;
    ms = 100;
  }
  setTimeout(function () {
    if (cb) cb();
  }, ms);
};
