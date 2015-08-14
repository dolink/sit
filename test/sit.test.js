'use strict';

var t = require('chai').assert;
var sit = require('../');

describe('sit', function () {

  describe('container', function () {
    it('should accept value facet', function () {
      var container = sit.container({
        foo: ['value', 100]
      });

      t.equal(container.get('foo'), 100);
    });

    it('should get container self', function () {
      var container = sit.container();
      container.invoke(function (container) {
        t.ok(container);
        t.isFunction(container.invoke);
      });
    });

    it('should access builtin $options facet', function () {
      var container = sit.container({
        foo: function ($options) {
          return $options.foo;
        }
      }, {foo: 'bar'});

      t.equal(container.get('foo'), 'bar');
    });

    it('should access builtin $logs facet', function () {
      var container = sit.container();
      t.ok(container.get('$logs'));
    });

    it('should throw error with full path if no provider', function () {
      var container = sit.container({
        a: function (b) {
          return 'a-value';
        },
        b: function (c) {
          return 'b-value';
        }
      });

      t.throw(function () {
        container.get('a');
      }, 'No provider for "c"! (Resolving: a -> b -> c)');
    });

    it('should init eagerly by run', function (done) {
      var hello;
      var container = sit.container({
        foo: function () {
          hello = 'world';
        }
      });

      container.run(function (foo) {
        t.equal(hello, 'world');
        done();
      });
    });
  });

});
