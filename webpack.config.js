// This library allows us to combine paths easily
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");


module.exports = {
  entry: path.resolve(__dirname, 'src', 'ld2h.js'),
  output: {
    path: path.resolve(__dirname, 'distribution', 'latest'),
    filename: 'ld2h.js',
    libraryTarget: 'var',
    library: 'ld2h'
  },
  module: {
    rules: [
       {
           test: /\.js/,
           exclude: /node_modules/,
           use: {
              loader: 'babel-loader',
              options: { presets: ['env'] }
           }
       }
    ]
 },
 externals: {
   'node-fetch': 'fetch',
   'xmldom': 'window',
   'jquery': '$',
   'ext-rdflib': "$rdf"
 },
 devtool: 'source-map',
 plugins: [
  new UglifyJSPlugin({
    test: /\.js($|\?)/i,
    sourceMap: true,
    uglifyOptions: {
        compress: true
    }
  })
]
};