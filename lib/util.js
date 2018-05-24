var path = require('path')
var load = require('load-pkg-config')

module.exports = {
  getPkg: getPkg,
  getConfig: getConfig,
  collectTransformModules: collectTransformModules,
  loaderNameMatches: loaderNameMatches
}

function loaderNameMatches (rule, loaderName) {
  return rule && rule.loader && typeof rule.loader === 'string' &&
    (
      rule.loader === loaderName ||
      rule.loader.indexOf(path.sep + loaderName + path.sep) !== -1 ||
      rule.loader.indexOf('@' + loaderName + path.sep) !== -1
    )
}

function collectTransformModules (initTransformModules, transformModules, context, key) {
  var names = Object.keys(initTransformModules)
  names.forEach(function (name) {
    if (name) {
      var conf = initTransformModules[name]
      // set init transform modules config
      if (!transformModules[name]) {
        if (conf) {
          transformModules[name] = conf
        }
        // deep into node_modules
        var pkg = getPkg(name, context)
        if (pkg && pkg.modulePath !== context) {
          var subPkgTransformModules = pkg[key]
          subPkgTransformModules && collectTransformModules(subPkgTransformModules, transformModules, pkg.modulePath, key)
        }
      } else {
        if (JSON.stringify(transformModules[name]) !== JSON.stringify(conf)) {
          console.warn('[webpack-transform-modules-plugin] There are multiple node modules configured "transformModules" with module: "' + name + '"')
        }
      }
    }
  })
  return transformModules
}

var rootCwd = process.cwd()
function getPkg (name, cwd) {
  if (!cwd) {
    cwd = rootCwd
  }
  var pkg = load(name, cwd)
  return pkg || null
}

function getConfig (name, key, cwd) {
  var pkg = getPkg(name, cwd)
  if (pkg) {
    return pkg[key]
  }
  return null
}
