"use strict";

var when = require('when');

module.exports = function () {
  return MusherFacet;
};

function MusherFacet($logs, $options) {
  var musher = require('musher');
  var facetname = MusherFacet.facetname;
  var log = $logs.get('sit:musher#' + facetname);

  var options = $options[facetname];
  var socket = musher.connect(options);

  log.debug('connecting to %s://%s:%d',
    socket.settings.useSSL ? 'mqtts' : 'mqtt', socket.settings.host, socket.settings.port);

  socket.on('connected', function () {
    log.info('connected');
  });
  socket.on('reconnect', function () {
    log.debug('reconnect');
  });
  socket.on('offline', function () {
    log.debug('offline');
  });
  socket.on('error', function (err) {
    log.error(err.message);
  });

  socket.$promise = when.promise(function (resolve) {
    socket.ready(resolve);
  });
  return socket;
};
