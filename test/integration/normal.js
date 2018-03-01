var path = require('path')
var webpack = require('webpack')
var webpackConfig = require('../cases/normal/webpack.config')
var expect = require('chai').expect

describe('normal case', function () {
  it('webpack options should be correct', function (done) {
    webpack(webpackConfig, function (err, stats) {
      var compiler = stats.compilation.compiler
      var options = compiler.options
      var rule = options.module.rules[0]
      expect(rule.options.plugins.length)
        .to.equal(1)
      var ret = require('../cases/normal/app.js')
      expect(ret.a).to.equal('a')
      expect(ret.b).to.equal('ba')
      done()
    })
  })
})
