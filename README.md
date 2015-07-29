# sit

[![NPM version][npm-image]][npm-url] 
[![Build Status][circleci-image]][circleci-url] 
[![Dependency Status][daviddm-image]][daviddm-url]

> A node.js library for micro service based on node-di.

## Usage

```js
var sit = require('../');

var container = sit.container({
  store: sit.facets.kvstore()
}, {
  store: {
    adapter: 'memory' // or 'redis'
  }
});

var store = container.get('store');
var bucket = store.createBucket('sit-example');
bucket.set('foo', 'bar', function (err) {
  if (err) {
    throw err;
  }
  bucket.get('foo', function (err, value) {
    console.log(value); // 'bar'
    bucket.del('foo', function (err) {
      process.exit();
    });
  });
});
```

## License

MIT © [Tao Yuan]()


[npm-image]: https://badge.fury.io/js/sit.svg
[npm-url]: https://npmjs.org/package/sit
[circleci-image]: https://circleci.com/gh/dolink/sit.svg?style=shield
[circleci-url]: https://circleci.com/gh/dolink/sit
[daviddm-image]: https://david-dm.org/dolink/sit.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/dolink/sit
