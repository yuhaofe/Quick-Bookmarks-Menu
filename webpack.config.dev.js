const { merge } = require('webpack-merge');
const ExtensionReloader = require('webpack-extension-reloader');
const common = require('./webpack.config.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new ExtensionReloader(),
  ],
});
