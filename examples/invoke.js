"use strict";

var sit = require('../');

var container = sit.container({
  store: sit.facets.kvstore
}, {
  store: {
    adapter: 'memory' // or 'redis'
  }
});

container.invoke(function (store) {
  var bucket = store.createBucket('sit-example');
  bucket.set('foo', 'bar', function (err) {
    if (err) { throw err; }
    bucket.get('foo', function (err, value) {
      console.log(value); // 'bar'
      bucket.del('foo', function (err) {
        process.exit();
      });
    });
  });
});
