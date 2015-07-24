"use strict";

var when = require('when');

module.exports = function () {
  return MusherFacet;
};

function MusherFacet($logs, $options) {
  var musher = require('musher');
  var facetname = MusherFacet.facetname;
  var log = $logs.get('facet:musher#' + facetname);

  var options = $options[facetname];
  var socket = musher.connect(options);

  log.debug('#%s connecting to %s://%s:%d', facetname,
    socket.settings.useSSL ? 'mqtts' : 'mqtt', socket.settings.host, socket.settings.port);

  socket.on('connected', function () {
    log.info('#%s connected', facetname);
  });
  socket.on('reconnect', function () {
    log.debug('#%s reconnect', facetname);
  });
  socket.on('offline', function () {
    log.debug('#%s offline', facetname);
  });
  socket.on('error', function (err) {
    log.error('#%s %s', facetname, err.message);
  });

  socket.$promise = when.promise(function (resolve) {
    socket.ready(resolve);
  });
  return socket;
};
