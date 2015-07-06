# koa-i18n-2

> I18n for koa, based on [i18n-2].
> **NOTE**: If want to use koa-i18n-2, [koa-locale] must be required!

[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

### Differences with koa-i18n

koa-i18n-2 will attempt to find the best match from the supported locales, whereas koa-i18n will only find exact matches.
For example, if a user requests `es-MX` and you support `['en-US', 'es-ES']`, koa-i18n will use `en-US`, while koa-i18n-2 will use `es-ES`.

### Installation

```bash
$ npm install koa-i18n-2
```

### Usage

```js
var app = require('koa')();
var locale = require('koa-locale'); //  detect the locale
var render = require('koa-swig');   //  swig render
var i18n = require('koa-i18n-2');

// Required!
locale(app);

app.context.render = render({
  root: __dirname + '/views/',
  ext: 'html'
});

app.use(i18n(app, {
  directory: './config/locales',
  locales: ['zh-CN', 'en'], //  `zh-CN` defaultLocale, must match the locales to the filenames
  modes: [
    'query',                //  optional detect querystring - `/?locale=en-US`
    'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
    'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
    'header',               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
    'url',                  //  optional detect url         - `/en`
    'tld'                   //  optional detect tld(the last domain) - `koajs.cn`
  ]
}));

app.use(function *(next) {
  this.body = this.i18n.__('any key');
});

app.use(function *(next) {
  yield this.render('index')
});
```

> **Tip**: We can change position of the elements in the `modes` array.
> If one mode finds a match, the modes after it will be ignored.


### Dependencies

* [debug][]
* [i18n-2][]
* [koa-locale][] - Get locale variable from query, subdomain, accept-languages or cookie
* [negotiator][]
* [utils-merge][]

### License

  MIT

[debug]: https://github.com/visionmedia/debug
[i18n-2]: https://github.com/jeresig/i18n-node-2
[koa-locale]: https://github.com/koa-modules/koa-locale
[negotiator]: https://github.com/jshttp/negotiator
[utils-merge]: https://github.com/jaredhanson/utils-merge

[npm-img]: https://img.shields.io/npm/v/koa-i18n-2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-i18n-2
[travis-img]: https://img.shields.io/travis/strawbrary/koa-i18n-2.svg?style=flat-square
[travis-url]: https://travis-ci.org/strawbrary/koa-i18n-2
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[david-img]: https://img.shields.io/david/strawbrary/koa-i18n-2.svg?style=flat-square
[david-url]: https://david-dm.org/strawbrary/koa-i18n-2
