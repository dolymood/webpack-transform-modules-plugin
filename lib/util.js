var path = require('path')
var load = require('load-pkg-config')

module.exports = {
  getPkg: getPkg,
  getConfig: getConfig,
  collectTransformModules: collectTransformModules,
  loaderNameMatches: loaderNameMatches,
  setTransformModules: setTransformModules
}

function loaderNameMatches (rule, loaderName) {
  return rule && rule.loader && typeof rule.loader === 'string' &&
    (
      rule.loader === loaderName ||
      rule.loader.indexOf(path.sep + loaderName + path.sep) !== -1 ||
      rule.loader.indexOf('@' + loaderName + path.sep) !== -1
    )
}

function collectTransformModules (walkQueue, walked, transformModules, context, key) {
  while(walkQueue.length) {
    var depInfo = walkQueue.shift()
    var pkg = getPkg(depInfo.name, depInfo.context)
    if (!pkg || walked[pkg.modulePath]) {
      continue
    }
    walked[pkg.modulePath] = true
    var subPkgTransformModules = pkg[key]
    setTransformModules(transformModules, pkg[key] || {}, pkg.modulePath)
    var subDep = getDeepWalkDep(pkg, key)
    walkQueue = walkQueue.concat(subDep)
  }
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

function getDeepWalkDep (pkg, key) {
  var deepWalkDep = []
  Object.keys(pkg.dependencies || {}).forEach(function (k) {
    deepWalkDep.push({
      name: k,
      context: pkg.modulePath
    })
  })
  return deepWalkDep
}

function setTransformModules(transformModules, optMap, fromContext) {
  var transNames = Object.keys(optMap)
  transNames.forEach(name => {
    if (!transformModules[name]) {
      optMap[name] && (transformModules[name] = optMap[name])
      return
    }
    if (JSON.stringify(transformModules[name]) !== JSON.stringify(optMap[name])) {
      console.warn('[webpack-transform-modules-plugin] There are multiple node modules configured "transformModules" with module: "' + name + '", ' + 'in:' + fromContext)
    }
  })
}
