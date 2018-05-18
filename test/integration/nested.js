var path = require('path')
var webpack = require('webpack')
var webpackConfig = require('../cases/nested/webpack.config')
var expect = require('chai').expect

describe('nested case', function () {
  it('webpack options should be correct', function (done) {
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
})
