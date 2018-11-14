var path = require('path')
var webpack = require('webpack')
var webpackConfig = require('../cases/nested/webpack.config')
var webpackConfig2 = require('../cases/nested-dep/webpack.config')
var expect = require('chai').expect

describe('nested case', function () {
  var warns = []
  var originConsoleWarn = null
  beforeEach(function() {
    console.warn = function (str) {
      warns.push(str)
    }
  })
  afterEach(function() {
    console.warn = originConsoleWarn
    warns = []
    originConsoleWarn = null
  })
  it('plugin options', function (done) {
    webpack(webpackConfig, function (err, stats) {
      var compiler = stats.compilation.compiler
      var options = compiler.options
      var rule = options.module.rules[0]
      expect(rule.use.options.plugins.length)
        .to.equal(1)
      var ret = require('../cases/nested/app.js')
      expect(ret.a).to.equal('nested a')
      expect(ret.b).to.equal('nested b, nested inner a, @dd nested inner a')
      expect(ret.pkg.name).to.equal('nested')
      done()
    })
  })
  it('nested dep', function (done) {
    webpack(webpackConfig2, function (err, stats) {
      var compiler = stats.compilation.compiler
      var options = compiler.options
      var rule = options.module.rules[0]
      expect(rule.use.options.plugins.length)
        .to.equal(1)
      var ret = require('../cases/nested-dep/app.js')
      expect(ret.a).to.equal('nested a')
      expect(ret.b).to.equal('nested b, nested d, nested e, nested a@0.0.2')
      expect(ret.c).to.equal('nested c')
      expect(ret.d).to.equal('nested d')
      expect(ret.pkg.name).to.equal('nested')
      expect(warns.length).to.equal(2)
      expect(warns[0]).to.equal('[webpack-transform-modules-plugin] There are multiple node modules configured "transformModules" with module: "a", in:/Users/didi/xiaoju/github/webpack-transform-modules-plugin/test/cases/nested-dep/node_modules/d')
      expect(warns[1]).to.equal('[webpack-transform-modules-plugin] There are multiple node modules configured "transformModules" with module: "a", in:/Users/didi/xiaoju/github/webpack-transform-modules-plugin/test/cases/nested-dep/node_modules/b/node_modules/a')
      done()
    })
  })
})
