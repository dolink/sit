"use strict";

var sit = require('../');

var injector = sit.injector({
  store: sit.facets.kvstore
}, {
  store: {
    adapter: 'memory' // or 'redis'
  }
});

injector.invoke(function (store) {
  var bucket = store.createBucket('sit-example');
  bucket.set('foo', 'bar', function (err) {
    if (err) throw err;
    bucket.get('foo', function (err, value) {
      console.log(value); // 'bar'
      bucket.del('foo', function (err) {
        process.exit();
      });
    })
  });
});
