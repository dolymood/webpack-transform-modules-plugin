var path = require('path')
var expect = require('chai').expect
var TransformModulesPlugin = require('../../lib/index')

describe('TransformModulesPlugin', function () {
  it('new', function () {
    var p = new TransformModulesPlugin()
    expect(p.key).to.equal('transformModules')
    expect(p.initTransformModules).to.be.null
    p = new TransformModulesPlugin({
      transformModules: {
        a: {
          transform: 'a/${member}'
        },
        b: {
          transform: 'b/${member}'
        }
      }
    })
    expect(Object.keys(p.initTransformModules).length).to.equal(2)
    expect(p.initTransformModules.b.transform).to.equal('b/${member}')
  })
  it('#apply()', function () {
    var p = new TransformModulesPlugin()
    var context = path.resolve(__dirname, '../cases/normal')
    var compiler = {
      _plugins: [],
      options: {
        context: context,
        module: {
          rules: [
            {
              test: /\.js$/,
              loader: 'babel-loader'
            },
            {
              test: /\.ejs$/,
              use: 'babel-loader'
            },
            {
              test: /\.mjs$/,
              use: [
                'babel-loader',
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: ['a-plugin']  
                  }
                },
                {
                  loader: 'm-loader',
                  options: {
                    plugins: ['m-plugin']
                  }
                }
              ]
            },
            {
              test: /\.vue$/,
              loader: 'vue-loader'
            },
            {
              test: /\.vue$/,
              use: [
                'vue-loader',
                {
                  loader: 'vue-loader',
                  options: {
                    loaders: {}
                  }
                },
                {
                  loader: 'vue-loader',
                  options: {
                    loaders: {
                      js: 'babel-loader'
                    }
                  }
                },
                {
                  loader: 'vue-loader',
                  options: {
                    loaders: {
                      js: 'myjs-loader'
                    }
                  }
                }
              ]
            }
          ]
        }
      },
      plugin: function (name, fn) {
        if (Array.isArray(name)) {
          return name.forEach(function (n) {
            compiler._plugins.push({
              name: n,
              cb: fn
            })
          })
        }
        compiler._plugins.push({
          name: name,
          cb: fn
        })
      }
    }
    p.apply(compiler)
    compiler._plugins[0].cb(compiler, function () {
      var jsPlugins = compiler.options.module.rules[0].options.plugins
      var ejsPlugins = compiler.options.module.rules[1].use[0].options.plugins
      var mjsPlugins = compiler.options.module.rules[2].use[0].options.plugins
      var mjsPlugins2 = compiler.options.module.rules[2].use[1].options.plugins
      var mjsPlugins3 = compiler.options.module.rules[2].use[2].options.plugins
      expect(jsPlugins.length)
        .to.equal(1)
      expect(ejsPlugins.length)
        .to.equal(1)
      expect(mjsPlugins.length)
        .to.equal(1)
      expect(mjsPlugins2.length)
        .to.equal(2)
      expect(mjsPlugins3.length)
        .to.equal(1)
      expect(jsPlugins[0][1].a)
        .to.be.an('object')
      expect(jsPlugins[0][1].b)
        .to.be.an('object')
      expect(mjsPlugins2[0])
        .to.equal('a-plugin')
      expect(mjsPlugins3[0])
        .to.equal('m-plugin')

      var vueLoader = compiler.options.module.rules[3]
      expectVueLoader(vueLoader)
      var vueUseLoader = compiler.options.module.rules[4].use
      var vueUseConf = vueUseLoader[0]
      var vueUseConf2 = vueUseLoader[1]
      var vueUseConf3 = vueUseLoader[2]
      var vueUseConf4 = vueUseLoader[3]
      expectVueLoader(vueUseConf)
      expectVueLoader(vueUseConf2)
      expectVueLoader(vueUseConf3)
      expectVueLoader(vueUseConf4, 1)

      function expectVueLoader (vueLoader, index) {
        if (!index) {
          index = 0
        }
        expect(vueLoader.options.loaders.js[index].loader)
          .to.equal('babel-loader')
        expect(vueLoader.options.loaders.js[index].options.plugins[0][0])
          .to.equal('babel-plugin-transform-modules')
        expect(vueLoader.options.loaders.js[index].options.plugins[0][1])
          .to.be.an('object')
      }
    })
  })
})
