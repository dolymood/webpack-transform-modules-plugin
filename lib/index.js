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
  var called = false
  compiler.plugin(['before-run', 'watch-run'], function (compiler, callback) {
    if (called) return callback()
    called = true
    /* istanbul ignore if */
    if (compiler.compiler) {
      // fix https://github.com/webpack/webpack/pull/5739
      compiler = compiler.compiler
    }
    var transformModules = that._collectTransformModules(compiler)
    if (Object.keys(transformModules).length) {
      var rules = compiler.options.module.rules
      rules && rules.forEach(iterRule)
    }
    callback()
    function iterRule(rule, i) {
      if (doRule(rule, 'loader')) {
      } else if (doRule(rule, 'use')) {
      } else if (rule.oneOf) {
        if (!Array.isArray(rule.oneOf)) {
          rule.oneOf = [rule.oneOf]
        }
        rule.oneOf.forEach(iterRule)
      }
    }
    function doRule (rule, key) {
      var conf = rule[key]
      if (conf) {
        if (Array.isArray(conf)) {
          conf.forEach(function (loaderConf, i) {
            if (typeof loaderConf === 'string') {
              loaderConf = conf[i] = {
                loader: loaderConf
              }
            }
            updateLoaderConf(loaderConf)
          })
        } else {
          if (key === 'use') {
            if (typeof conf === 'string') {
              conf = rule.use = {
                loader: conf
              }
            }
            updateLoaderConf(conf)
          } else {
            updateLoaderConf(rule)
          }
        }
        return true
      }
      return false
    }
    function updateLoaderConf (rule) {
      if (util.loaderNameMatches(rule, 'babel-loader')) {
        updateRule(rule)
      } else if (util.loaderNameMatches(rule, 'vue-loader')) {
        updateVueLoaderOptions(rule)
      }
    }
    function updateRule (conf) {
      if (!conf.options) {
        conf.options = {}
      }
      if (!conf.options.plugins) {
        conf.options.plugins = []
      }
      if (!Array.isArray(conf.options.plugins)) {
        conf.options.plugins = [conf.options.plugins]
      }
      var name = 'babel-plugin-transform-modules'
      var plugins = conf.options.plugins
      var added = plugins.some(function (plugin) {
        return plugin === name || plugin[0] === name
      })
      !added && plugins.push([
        name,
        transformModules
      ])
    }
    function updateVueLoaderOptions (conf) {
      if (!conf.options) {
        conf.options = {}
      }
      if (!conf.options.loaders) {
        conf.options.loaders = {}
      }
      var jsConf = conf.options.loaders.js
      if (!jsConf) {
        jsConf = conf.options.loaders.js = []
      } else if (typeof jsConf === 'string') {
        if (jsConf === 'babel-loader') {
          // reset
          jsConf = conf.options.loaders.js = []
        } else {
          jsConf = conf.options.loaders.js = [
            {
              loader: jsConf
            }
          ]
        }
      }
      jsConf.push({
        loader: 'babel-loader',
        options: {
          plugins: [
            ['babel-plugin-transform-modules', transformModules]
          ]
        }
      })
    }
  })
}

TransformModulesPlugin.prototype._collectTransformModules = function (compiler) {
  var transformModules = {}
  var context = compiler.options.context
  var initTransformModules = this.initTransformModules
  if (!initTransformModules) {
    var appPkg = util.getPkg('.', context)
    initTransformModules = appPkg[this.key]
    if (!initTransformModules) {
      initTransformModules = {}
      Object.keys(appPkg.dependencies || {}).forEach(function (k) {
        initTransformModules[k] = null
      })
    }
  }
  // collect transform modules in node_modules
  util.collectTransformModules(initTransformModules || {}, transformModules, context, this.key)
  return transformModules
}

module.exports = TransformModulesPlugin
