'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var request = require('supertest');
var koa = require('koa');
var compose = require('koa-compose');
var locale = require('koa-locale');
var render = require('koa-swig');
var views = require('koa-views');
var i18n = require('..');

describe('koa-i18n', function() {

  describe('Detect the Querystring', function() {
    var app = koa();

    locale(app);

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en'],
      modes: ['query']
    }));

    app.use(function*(next) {
      this.body = this.i18n.__("locales.en");
    });

    it('should be `en` locale when exact', function(done) {
      request(app.listen())
        .get('/?locale=en')
        .expect(/english/i)
        .expect(200, done);
    });

    it('should be `en` locale when territory differs', function(done) {
      request(app.listen())
        .get('/?locale=en-US')
        .expect(/english/i)
        .expect(200, done);
    });
  });

  describe('Detect the Subdomain', function() {
    var app = koa();

    locale(app);

    var enApp = koa();
    enApp.use(function*() {
      this.body = this.getLocaleFromSubdomain();
    });
    enApp = compose(enApp);

    var zhCNApp = koa();
    zhCNApp.use(function*() {
      this.body = this.getLocaleFromSubdomain();
    });
    zhCNApp = compose(zhCNApp);

    app.use(function*(next) {
      switch (this.host) {
        case 'en.koajs.com':
          return yield enApp.call(this, next);
        case 'zh-CN.koajs.com':
          return yield zhCNApp.call(this, next);
      }
      yield next;
    });

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en', 'zh-tw'],
      modes: ['subdomain']
    }));

    app.use(function*(next) {
      this.body = this.i18n.__("locales.en");
    });

    it('should be `en` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Host', 'eN.koajs.com')
        .expect(/English/)
        .expect(200, done);
    });

    it('should be `zh-cn` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Host', 'zh-CN.koajs.com')
        .expect(/英文/)
        .expect(200, done);
    });

    it('should be `zh-tw` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Host', 'zh-TW.koajs.com')
        .expect(/locales.en/)
        .expect(200, done);
    });

  });

  describe('Dected the header', function() {
    var app = koa();

    locale(app);

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en', 'zh-tw'],
      modes: ['header']
    }));

    app.use(function*(next) {
      this.body = this.i18n.__("locales.zh-CN");
    });

    it('should be `zh-tw` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Accept-Language', 'zh-TW')
        .expect(/簡體中文/)
        .expect(200, done);
    });

    it('should be `en` locale when territory differs', function(done) {
      request(app.listen())
        .get('/')
        .set('Accept-Language', 'en-US')
        .expect(/Chinese\(Simplified\)/)
        .expect(200, done);
    });
  });

  describe('Detect the cookie', function() {
    var app = koa();

    locale(app);

    app.use(i18n(app, {
      directory: __dirname + '/fixtures/locales',
      locales: ['zh-CN', 'en', 'zh-tw'],
      modes: ['cookie']
    }));

    app.use(function*(next) {
      this.body = this.i18n.__("locales.zh-CN");
    });

    it('should be `zh-cn` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .expect(/简体中文/)
        .expect(200, done);
    });

    it('should be `en` locale when territory differs', function(done) {
      request(app.listen())
        .get('/')
        .set('Cookie', 'locale=en-AU')
        .expect(/Chinese\(Simplified\)/)
        .expect(200, done);
    });
  });

  describe('working together, i18n and swig-render', function() {
    it('should be render by zh-cn locale', function(done) {
      var app = koa();

      locale(app);

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }));

      app.context.render = render({
        root: __dirname + '/fixtures/',
        ext: 'html'
      });

      app.use(function*(next) {
        yield this.render('index')
      });

      request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .expect(/英文/)
        .expect(200, done);
    });
  });

  describe('working together with koa-views, jade render', function() {
    it('should be render by zh-cn locale', function(done) {
      var app = koa();

      locale(app, 'lang');

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie']
      }));

      app.use(function*(next) {
        // TODO: waiting https://github.com/queckezz/koa-views/pull/26
        this.locals = this.state;
        yield * next;
      });

      app.use(views(__dirname + '/fixtures/', {
        default: 'jade'
      }));

      app.use(function*(next) {
        yield this.render('index')
      });

      request(app.listen())
        .get('/')
        .set('Cookie', 'lang=zh-cn')
        .expect(/<div><p>英文<\/p><\/div>/)
        .expect(200, done);
    });
  });

  describe('Dected the header and cookie', function() {
    var app;
    beforeEach(function () {
      app = koa();

      locale(app);

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie', 'header']
      }));

      app.use(function*(next) {
        this.body = this.i18n.__("locales.zh-CN");
      });
    });

    it('should be `zh-tw` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Accept-Language', 'zh-TW')
        .expect(/簡體中文/)
        .expect(200, done);
    });

    it('should be `zh-cn` locale', function(done) {
      request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .set('Accept-Language', 'en')
        .expect(/简体中文/)
        .expect(200, done);
    });

    it('should be `en` locale when territory differs', function(done) {
      request(app.listen())
        .get('/')
        .set('Cookie', 'locale=en-US')
        .set('Accept-Language', 'zh-TW')
        .expect(/Chinese\(Simplified\)/)
        .expect(200, done);
    });
  });

  describe('accepts custom function as a mode', function() {
    var app,
    customMode = function() {
      return this.state.defaultLocale;
    };

    before(function () {
      app = koa()

      locale(app)

      app.use(function* dummyMiddleware(next) {
        this.state.defaultLocale = 'en';
        yield next;
      });

      app.use(i18n(app, {
        directory: __dirname + '/fixtures/locales',
        locales: ['zh-CN', 'en', 'zh-tw'],
        modes: ['cookie', customMode]
      }))

      app.use(function*(next) {
        this.body = this.i18n.__("locales.zh-CN");
      })
    })

    it('should be `en` locale', function() {
      return request(app.listen())
        .get('/')
        .expect(/Chinese\(Simplified\)/)
        .expect(200)
    })

    it('should be `zh-cn` locale', function() {
      return request(app.listen())
        .get('/')
        .set('Cookie', 'locale=zh-cn')
        .expect(/简体中文/)
        .expect(200)
    })
  });
});