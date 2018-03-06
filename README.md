# webpack-transform-modules-plugin [![Build Status](https://travis-ci.org/dolymood/webpack-transform-modules-plugin.svg?branch=master)](https://travis-ci.org/dolymood/webpack-transform-modules-plugin?branch=master) [![codecov.io](http://codecov.io/github/dolymood/webpack-transform-modules-plugin/coverage.svg?branch=master)](http://codecov.io/github/dolymood/webpack-transform-modules-plugin?branch=master)

A webpack plugin for [babel-plugin-transform-modules](https://github.com/dolymood/babel-plugin-transform-modules). It is used to handle `babel-plugin-transform-modules` 'transform-modules' options in node_modules.

Note: This plugin only works with `babel-loader` and `vue-loader`.

### Install

```shell
npm i webpack-transform-modules-plugin --save-dev
```

### Usage

```js
var TransformModulesPlugin = require('webpack-transform-modules-plugin')

module.exports = {
  // ...
  module: {
    rules: [
      // ...
      {
        test: /\.js$/,
        loader: 'babel-loader'
        // this plugin will be include the packages "transformModules" config
        // eg: {"transformModules": {"a": {...}}} // in package.json
        // the current rule's options plugins will be like: 
        /*
         `[require('babel-plugin-transform-modules'), {
            'a': {
              ...
            }
          }]`
         */
      }
      // ...
    ]
  },
  plugins: [
    new TransformModulesPlugin()
  ]
}
```

#### Options

```js
new TransformModulesPlugin({
  transformModules: {
    a: {
      transform: 'a/${member}'
    },
    b: null
  }
})
```

In this demo, this plugin will load `a` and `b` packages "transformModules" config in each package.json and it will load sub packages "transformModules" configs too.

* `transformModules {Object}` default `undefined`, application init `babel-plugin-transform-modules` 'transform-modules' options, if it is `undefined` then this plugin will get `transformModules` value in `package.json` as the init config.
