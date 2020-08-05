const { merge } = require('webpack-merge');
const ZipPlugin = require('zip-webpack-plugin');
const common = require('./webpack.config.common');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new ZipPlugin({
      filename: 'dist.zip',
    }),
  ],
});
