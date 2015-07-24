"use strict";

var when = require('when');

module.exports = function MusherFactory($logs, $options) {
  var musher = require('musher');
  var options = $options[MusherFactory.instname];
  var socket = musher.connect(options);
  socket.$promise = when.promise(function (resolve) {
    socket.ready(resolve);
  });
  return socket;
};
