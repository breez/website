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
          { loader: 'sass-loader', options: { sourceMap: true, sassOptions: {"silenceDeprecations": ["mixed-decls", "color-functions", "global-builtin", "import"]} } },
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
        'report/index': {
          import: paths.src + '/views/pages/report/report.html',
        },
        'misty/index': {
          import: paths.src + '/views/pages/misty/misty.html',
        },
      },
      loaderOptions: {
        sources: [
          {
            tag: 'meta',
            attributes: ['content'],
            // allow to handle an image in the 'content' attribute of the 'meta' tag
            // when the 'property' attribute contains one of: 'og:image', 'og:video'
            // or the 'name' attribute contains 'twitter:image'
            filter: ({ attributes }) => {
              const attrs = {
                "name": ["twitter:image"],
                "property": ["og:image", "og:video"],
              }
              for (const [attrName, attrValues] of Object.entries(attrs)) {
                if (attributes[attrName] && attrValues.indexOf(attributes[attrName]) >= 0) {
                  return true; // return true or undefined to enable processing
                }
              }
              return false; // return false to disable processing
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
