const path = require('path');
// const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');

module.exports = {

  entry: {
    'app': './src/app/animate.js'
  },

  module: {

    rules: [

      {
        test: /\.js$/,
        exclude: /(node_modules)|(assets)/,
        use: 'babel-loader'
      },

      // {
      // 	test: /\.css/,
      //   use: ['style-loader','css-loader']
      // },

      {
        test: /\.(|json|jpg|png|gif|obj|mtl|dae|wav|ogg|eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
      }

    ]

  },

  plugins: [
    // new CommonsChunkPlugin({
    //   name: ['app', 'vendor'],
    //   minChunks: Infinity
    // }),
    new ProvidePlugin({
      'THREE': 'three'
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, '../src/index.html'),
      favicon: path.resolve(__dirname, '../src/favicon.ico')
    })
  ]

};
