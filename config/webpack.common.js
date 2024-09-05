const paths = require('./paths')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  output: {
    path: paths.build,
    filename: '[name][contenthash].js',
    clean: false, //false - fix img/svg dissapear after reload;
    assetModuleFilename: '[name][ext]',
    publicPath: '/'
  },

  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },

      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
      {
        test: /\.(ico|png|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource'
      },
      {
        test: /.(sass|scss|css)$/,

        use: [
          {
            loader: 'css-loader',
            options: { sourceMap: true, importLoaders: 2, modules: false },
          },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new CleanWebpackPlugin(),
    new HtmlBundlerPlugin({
      minify: true,
      minifyOptions: {
        removeComments: true,
        removeRedundantAttributes: false, // do not remove type="text"
      },
      entry: {
        'index': {
          import: paths.src + '/index.html',
        },
        'mobile/index': {
          import: paths.src + '/views/pages/mobile/mobile.html',
        },
        'sdk/index': {
          import: paths.src + '/views/pages/sdk/sdk.html',
          data: { form_topic: 'sdk-design-partner' },
        },
        'request-api-key/index': {
          import: paths.src + '/views/pages/sdk/sdk.html',
          data: { form_topic: 'sdk-liquid-api-key' },
        },
        'lsp/index': {
          import: paths.src + '/views/pages/lsp/lsp.html',
        },
        'cloud/index': {
          import: paths.src + '/views/pages/cloud/cloud.html',
        },
      },
      loaderOptions: {
        sources: [
          {
            tag: 'meta',
            attributes: ['content'],
            // allow to handle an image in the 'content' attribute of the 'meta' tag
            // when the 'property' attribute contains one of: 'og:image', 'og:video'
            filter: ({ attributes }) => {
              const attrName = 'name';
              const attrValues = ['twitter:image']; // allowed values of the property
              if (!attributes[attrName] || attrValues.indexOf(attributes[attrName]) < 0) {
                return false; // return false to disable processing
              }
              // return true or undefined to enable processing
            },
          },
        ],
      },
      css: {
        filename: 'styles/[name].[contenthash].css',
      },
    }),

    new CopyPlugin({
      patterns: [
        { from: "static", to: "./" },
      ],
    }),
  ],
  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': paths.src,
      assets: paths.public,
    },
  },
};
