var util = require('./util')

function TransformModulesPlugin (options) {
  if (!options) {
    options = {}
  }
  this.key = 'transformModules'
  this.initTransformModules = options.transformModules || null
}

TransformModulesPlugin.prototype.apply = function (compiler) {
  var that = this
  compiler.plugin(['before-run', 'watch-run'], function (compiler, callback) {
    /* istanbul ignore if */
    if (compiler.compiler) {
      // fix https://github.com/webpack/webpack/pull/5739
      compiler = compiler.compiler
    }
    var transformModules = that._collectTransformModules(compiler)
    if (Object.keys(transformModules).length) {
      var rules = compiler.options.module.rules
      rules && rules.forEach(function (rule) {
        if (rule.loader === 'babel-loader') {
          updateRule(rule, transformModules)
        } else if (rule.use) {
          if (!Array.isArray(rule.use)) {
            rule.use = [rule.use]
          }
          rule.use.forEach(function (loaderConf, i) {
            if (typeof loaderConf === 'string') {
              loaderConf = rule.use[i] = {
                loader: loaderConf
              }
            }
            updateRule(loaderConf, transformModules)
          })
        }
      })
    }
    callback()
    function updateRule (conf, transformModules) {
      if (!conf.options) {
        conf.options = {}
      }
      if (!conf.options.plugins) {
        conf.options.plugins = []
      }
      if (!Array.isArray(conf.options.plugins)) {
        conf.options.plugins = [conf.options.plugins]
      }
      var plugins = conf.options.plugins
      plugins.push([
        require('babel-plugin-transform-modules'),
        transformModules
      ])
    }
  })
}

TransformModulesPlugin.prototype._collectTransformModules = function (compiler) {
  var transformModules = {}
  var context = compiler.options.context
  var initTransformModules = this.initTransformModules
  if (!initTransformModules) {
    initTransformModules = util.getConfig('.', this.key, context)
  }
  // collect transform modules in node_modules
  util.collectTransformModules(initTransformModules || {}, transformModules, context, this.key)
  return transformModules
}

module.exports = TransformModulesPlugin
