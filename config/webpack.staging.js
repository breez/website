const { merge } = require("webpack-merge");

const paths = require("./paths");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  devtool: false,
  output: {
    publicPath: "https://n.breez.technology",
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
