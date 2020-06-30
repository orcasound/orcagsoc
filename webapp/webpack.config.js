/* eslint-disable */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const WebpackCdnPlugin = require('webpack-cdn-plugin')

module.exports = (_, argv) => {
    const isProduction = argv.mode === 'production'
    return {
        entry: { listen: './src/js/listen.js', index: './src/js/index.js' },
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: isProduction ? '/orcagsoc/' : '/',
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
            new webpack.EnvironmentPlugin({
                API_URL: isProduction
                    ? 'https://orcagsoc.herokuapp.com'
                    : 'http://localhost:5000',
            }),
            new WebpackCdnPlugin({
                modules: [
                    {
                        name: 'apexcharts',
                        var: 'ApexCharts',
                        path: 'dist/apexcharts.min.js',
                    },
                ],
                prodUrl: '//cdn.jsdelivr.net/npm/:name@:version/:path',
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: !isProduction,
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
                {
                    test: /\.html$/,
                    use: ['html-loader', 'markup-inline-loader'],
                },
            ],
        },
        devServer: {
            open: true,
            openPage: isProduction ? 'orcagsoc/' : '',
            contentBase: path.join(__dirname, 'dist'),
            historyApiFallback: {
                rewrites: [
                    {
                        from: /^\/listen/,
                        to: '/listen.html',
                    },
                    {
                        from: /^\/orcagsoc\/listen/,
                        to: '/orcagsoc/listen.html',
                    },
                ],
            },
        },
    }
}
