var path = require('path')
var expect = require('chai').expect
var util = require('../../lib/util')

describe('util', function () {
  it('#getConfig()', function () {
    var normalPath = path.resolve(__dirname, '../cases/normal')
    var config = util.getConfig('.', 'transformModules', normalPath)
    expect(config.a)
      .not.to.be.null
    expect(config.b)
      .not.to.be.null
    config = util.getConfig('b', 'transformModules', normalPath)
    expect(config.a)
      .not.to.be.null
    expect(config.b)
      .to.be.undefined
  })
  it('#collectTransformModules()', function () {
    var normalPath = path.resolve(__dirname, '../cases/normal')
    var initTransformModules = util.getConfig('.', 'transformModules', normalPath)
    var transformModules = {}
    util.collectTransformModules(initTransformModules, transformModules, normalPath, 'transformModules')
    expect(transformModules.a)
      .not.to.be.null
    expect(transformModules.b)
      .not.to.be.null

    var nestedPath = path.resolve(__dirname, '../cases/nested')
    transformModules = {}
    util.collectTransformModules({
      "a": {
        "transform": "a/${member}"
      },
      "b": null
    }, transformModules, nestedPath, 'transformModules')
    expect(transformModules.a)
      .not.to.be.null
    expect(transformModules.b)
      .to.be.undefined
    expect(transformModules['@dd/a'])
      .not.to.be.null
  })
  it('#loaderNameMatches()', function () {
    expect(util.loaderNameMatches({
      loader: 'babel-loader'
    }, 'babel-loader')).to.be.true
    expect(util.loaderNameMatches({
      loader: '/xx/babel-loader/i'
    }, 'babel-loader')).to.be.true
    expect(util.loaderNameMatches({
      loader: '@babel-loader/i'
    }, 'babel-loader')).to.be.true
    expect(util.loaderNameMatches({
      loader: '@babedl-loader/i'
    }, 'babel-loader')).to.be.false
  })
})
