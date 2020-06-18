/* eslint-disable */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')
const prod = process.env.NODE_ENV === 'production'

module.exports = {
    entry: { listen: './src/js/listen.js', index: './src/js/index.js' },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: prod ? '/orcagsoc' : '/',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/listen.html',
            filename: 'listen.html',
            favicon: './src/media/favicon.ico',
            chunks: ['listen'],
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            favicon: './src/media/favicon.ico',
            chunks: ['index'],
        }),
        new MiniCssExtractPlugin(),
        prod && new Dotenv(),
    ].filter(Boolean),
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: !prod,
                        },
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.mp3/i,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                },
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: ['file-loader', 'image-webpack-loader'],
            },
            { test: /\.html$/, use: ['html-loader', 'markup-inline-loader'] },
        ],
    },
    devServer: {
        open: true,
        // openPage: 'listen',
        contentBase: path.join(__dirname, 'dist'),
        historyApiFallback: {
            rewrites: [{ from: /^\/listen/, to: '/listen.html' }],
        },
    },
}
