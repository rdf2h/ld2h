// This library allows us to combine paths easily
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
//const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, 'src', 'ld2h.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'ld2h.js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['react', 'es2015'] }
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  externals: {
    'node-fetch': 'fetch',
    'xmldom': 'window'
  },
  devtool: 'source-map',
  plugins: [
    /*new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'RDF2h DocumentationS',
      template: 'pages/index.ejs', // Load a custom template (ejs by default see the FAQ for details) 
    }),
    new ExtractTextPlugin({
      filename: "style.css",
      allChunks: true
    })*/
  ]
};