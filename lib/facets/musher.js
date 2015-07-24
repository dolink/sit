"use strict";

var when = require('when');

module.exports = function MusherFactory($logs, $options) {
  var musher = require('musher');
  var instname = MusherFactory.instname;
  var log = $logs.get('facet:musher#' + instname);

  var options = $options[instname];
  var socket = musher.connect(options);

  log.debug('#%s connecting to %s://%s:%d', instname,
    socket.settings.useSSL ? 'mqtts' : 'mqtt', socket.settings.host, socket.settings.port);

  socket.on('connected', function () {
    log.info('#%s connected', instname);
  });
  socket.on('reconnect', function () {
    log.debug('#%s reconnect', instname);
  });
  socket.on('offline', function () {
    log.debug('#%s offline', instname);
  });
  socket.on('error', function (err) {
    log.error('#%s %s', instname, err.message);
  });

  socket.$promise = when.promise(function (resolve) {
    socket.ready(resolve);
  });
  return socket;
};
