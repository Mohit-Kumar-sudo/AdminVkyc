const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
    libraryTarget: 'commonjs2',
  },
  devtool: "inline-source-map", // enum
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  }
};