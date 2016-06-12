var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: "./src/znap.js",
  output: {
    library: 'Znap',
    libraryTarget: 'umd',
    path: __dirname + '/dist',
    filename: 'znap.js',
    publicPath: "/dist/",
    target: 'web',
  },
  devtool: 'inline-sourcemap',
  plugins: [],
};

// Others we'll probably want:
//    // minified:
//    output: {
//      filename: 'bundle.min.js',
//    },
//    plugins: [
//      //new webpack.optimize.DedupePlugin(),
//      //new webpack.optimize.OccurenceOrderPlugin(),
//      new webpack.optimize.UglifyJsPlugin({
//        mangle: false, sourcemap: false
//      }),
//    ]

//console.log(module.exports);
