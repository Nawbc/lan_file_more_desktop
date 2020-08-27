'use strict';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { resolve } = require('path');
const os = require('os');

const env = process.env.NODE_ENV;
const isProduction = env === 'production';

module.exports = {
	mode: env,
	devtool: isProduction ? false : 'cheap-module-eval-source-map',
	entry: {
		renderer: resolve(__dirname, '../../src/renderer/index.tsx')
	},
	target: 'electron-renderer',
	output: {
		path: resolve(__dirname, '../../dist'),
		filename: '[name].js',
		libraryTarget: 'commonjs2'
	},
	optimization: {
		minimize: isProduction,
		splitChunks: {
			cacheGroups: {
				common: {
					name: "common",
					chunks: "all",
					minSize: 1,
					priority: 0
				},
				vendor: {
					name: "vendor",
					test: /[\\/]node_modules[\\/]/,
					chunks: "all",
					priority: 10
				}
			}
		}
	},
	module: {
		rules: [
			{
				oneOf: [
					{
						test: [/\.(js|jsx|ts|tsx)$/],
						use: [
							{
								loader: 'ts-loader',
								options: {
									transpileOnly: true,
									experimentalWatchApi: true
								}
							},
							{
								loader: 'thread-loader',
								options: {
									worker: os.cpus().length
								}
							}
						]
					},
					{
						test: /\.(sa|sc|c)ss$/,
						include: [resolve(__dirname, '../../src/')],
						use: [
							'style-loader',
							{
								loader: 'css-loader',
								options: {
									sourceMap: isProduction
								}
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: isProduction
								}
							},
							{
								loader: 'thread-loader',
								options: {
									worker: os.cpus().length
								}
							}
						].filter(Boolean)
					},
					{
						test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
						loader: 'url-loader',
						options: {
							limit: 0x1400,
							name: 'resource/[name].[hash:8].[ext]'
						}
					},
					{
						loader: 'file-loader',
						exclude: [/\.(js|jsx|ts|tsx)$/, /\.htm?(.|l)$/, /\.json$/, /\.ejs$/],
						options: {
							name: 'resource/[name].[hash:8].[ext]'
						}
					},
					{
						test: /\.node$/,
						use: 'node-loader'
					}
				]
			}
		]
	},
	plugins: [
		new ForkTsCheckerWebpackPlugin({
			async: isProduction,
			typescript: {
				configFile: resolve(__dirname, '../../tsconfig.json')
			}
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: resolve(__dirname, '../../src/renderer/index.ejs'),
			minify: {
				removeRedundantAttributes: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true,
				removeComments: true,
				collapseBooleanAttributes: true
			},
			nodeModules: isProduction ? resolve(__dirname, '../../node_modules/') : false

		}),
		new webpack.HotModuleReplacementPlugin()
	].filter(Boolean),
	resolve: {
		extensions: ['.js', '.json', '.jsx', '.tsx', '.ts', '.json', '.css', '.scss', '.sass', '.node']
	},
	node: {
		global: true,
		__dirname: true,
		__filename: true
	}
};

