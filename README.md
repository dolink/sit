# sit

[![Greenkeeper badge](https://badges.greenkeeper.io/taoyuan/sit.svg)](https://greenkeeper.io/)

[![NPM version][npm-image]][npm-url] 
[![Build Status][travis-image]][travis-url] 
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
[travis-image]: http://img.shields.io/travis/taoyuan/needs.svg?style=flat
[travis-url]: https://travis-ci.org/taoyuan/needs
[daviddm-image]: https://david-dm.org/taoyuan/sit.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/taoyuan/sit
