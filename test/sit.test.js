'use strict';

var t = require('chai').assert;
var sit = require('../');

describe('sit', function () {

  describe('injector', function () {
    it('should accept value facet', function () {
      var injector = sit.injector({
        foo: ['value', 100]
      });

      t.equal(injector.get('foo'), 100);
    });

    it('should get injector self', function () {
      var injector = sit.injector();
      injector.invoke(function (injector) {
        t.ok(injector);
        t.isFunction(injector.invoke)
      });
    });

    it('should access builtin $options facet', function () {
      var injector = sit.injector({
        foo: function ($options) {
          return $options.foo;
        }
      }, {foo: 'bar'});

      t.equal(injector.get('foo'), 'bar');
    });

    it('should access builtin $logs facet', function () {
      var injector = sit.injector();
      t.ok(injector.get('$logs'));
    });

    it('should throw error with full path if no provider', function () {
      var injector = sit.injector({
        a: function (b) {
          return 'a-value';
        },
        b: function (c) {
          return 'b-value';
        }
      });

      t.throw(function () {
        injector.get('a');
      }, 'No provider for "c"! (Resolving: a -> b -> c)');
    });

    it('should init eagerly by run', function (done) {
      var hello;
      var injector = sit.injector({
        foo: function () {
          hello = 'world';
        }
      });

      injector.run(function (foo) {
        t.equal(hello, 'world');
        done();
      });
    });
  });

});
