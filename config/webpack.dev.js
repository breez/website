const { merge } = require('webpack-merge')

const common = require('./webpack.common')

module.exports = merge(common, {
  // Set the mode to development or production
  mode: 'development',

  // Control how source maps are generated
  devtool: 'inline-source-map',

  // Spin up a server for quick development
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
})