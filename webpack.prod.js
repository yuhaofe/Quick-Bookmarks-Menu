const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
var ZipPlugin = require('zip-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new ZipPlugin({
            filename: 'dist.zip'
        })
    ]
});