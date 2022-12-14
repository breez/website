const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { merge } = require('webpack-merge')

const paths = require('./paths')
const common = require('./webpack.common')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    publicPath: "https://breez.technology",
  },
  module: {
    rules: [
      {
        test: /.(sass|scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: false
            },
          },
          'postcss-loader',
          'sass-loader'
        ],
      },
    ]
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
      chunkFilename: '[id].css'
    })
  ]
})