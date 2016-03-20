var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: './src/scripts/app.js',
	output: {path: __dirname, filename: 'public/scripts/bundle.js'},
	module: {
		loaders: [
			{
				test: /.js?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015']
				}
			}
		]
	},
};
