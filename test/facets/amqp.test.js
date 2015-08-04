"use strict";

var t = require('chai').assert;
var s = require('../support');
var sit = require('../../');

describe('facets/mq/amqp', function () {
  this.timeout(10000);

  describe('initialize', function () {

    it('should initiate', function (done) {
      var container = sit.container({
        amqp: sit.facets.mq.amqp()
      }, {
        amqp: {
          url: 'amqp://guest:guest@localhost:5672'
        }
      });

      var amqp = container.get('amqp');
      amqp.$promise.then(function (conn) {
        t.ok(conn);
        s.delaycall(function () {
          amqp.close(done);
        });
      });
    });
  });

  describe('pubsub', function () {

    it('should publish and received in route', function (done) {
      var container = sit.container({
        amqp: sit.facets.mq.amqp()
      }, {
        amqp: {
          url: 'amqp://guest:guest@localhost:5672'
        }
      });

      var data = {
        foo: 'bar'
      };

      var amqp = container.get('amqp');
      amqp.$promise.then(function () {
        amqp.route('test.:arg', {queue: 'this_is_queue_name'}, function (err, message) {
          t.deepEqual(message.payload, data);
          s.delaycall(function () {
            amqp.close(done);
          });
        }).then(function () {
          amqp.publish('amq.topic', 'test.a', data);
        });
      });
    });
  });
});
