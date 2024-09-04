const path = require("path")
const webpack = require("webpack")

module.exports = {
  entry: './src/js/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "vm": require.resolve("vm-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "process": require.resolve("process/browser"),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: "process/browser"
    }),
  ],
}