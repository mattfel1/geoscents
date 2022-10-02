const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ['babel-polyfill', './client/client.js'],
  mode: 'development',
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // Apparently this broke after copy-webpack-plugin v9...
    new CopyWebpackPlugin({
        patterns: [
{
        context: './resources/databases/',
        from: '*.js',
        to: './public',
        force: true
    }
            ]
    })

  ]
}
