var webpack = require('webpack')
var path = require('path')

// variables
var isProduction =
  process.argv.indexOf('-p') >= 0 || process.env.NODE_ENV === 'production'
var sourcePath = path.join(__dirname, './src')
var outPath = path.join(__dirname, './dist')
const ManifestPlugin = require("webpack-manifest-plugin")
// plugins
var HtmlWebpackPlugin = require('html-webpack-plugin')
// var MiniCssExtractPlugin = require('mini-css-extract-plugin')
var WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


module.exports = {
  context: __dirname,
  entry: {
    app: './src/index.tsx'
  },
  output: {
    path: outPath,
    filename: isProduction ? '[contenthash].js' : '[hash].js',
    chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].[hash].js'
  },
  target: 'web',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ['module', 'browser', 'main'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              [
                '@babel/preset-env',
                { targets: { browsers: 'last 2 versions' } }, // or whatever your project requires
              ],
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              'react-hot-loader/babel',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
      //     {
      //       loader: 'css-loader',
      //       query: {
      //         modules: true,
      //         sourceMap: !isProduction,
      //         importLoaders: 1,
      //         localIdentName: isProduction
      //           ? '[hash:base64:5]'
      //           : '[local]__[hash:base64:5]'
      //       }
      //     },
      //     {
      //       loader: 'postcss-loader',
      //       options: {
      //         ident: 'postcss',
      //         plugins: [
      //           require('postcss-import')({ addDependencyTo: webpack }),
      //           require('postcss-url')(),
      //           require('postcss-preset-env')({
      //             /* use stage 2 features (defaults) */
      //             stage: 2
      //           }),
      //           require('postcss-reporter')(),
      //           require('postcss-browser-reporter')({
      //             disabled: isProduction
      //           })
      //         ]
      //       }
      //     }
      //   ]
      // },
      // static assets
      { test: /\.html$/, use: 'html-loader' },
      { test: /\.(a?png)$/, use: 'url-loader?limit=10000' },
      {
        test: /\.svg/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|gif|bmp|mp3|mp4|ogg|wav|eot|ttf|woff|woff2)$/,
        use: 'file-loader'
      }
    ]
  },
  optimization: {
    splitChunks: {
      name: true,
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: -10,
          filename: isProduction
            ? 'vendor.[contenthash].js'
            : 'vendor.[hash].js'
        }
      }
    },
    runtimeChunk: true
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
      DEBUG: false
    }),
    new WebpackCleanupPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: isProduction ? '[contenthash].css' : '[hash].css',
    //   disable: !isProduction
    // }),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/assets/index.html'
    }),
    new ManifestPlugin({
      fileName: "%PUBLIC_URL%/manifest.json"
  })
  ],
  devServer: {
    contentBase: sourcePath,
    hot: true,
    inline: true,
    historyApiFallback: {
      disableDotRule: true
    },
    proxy: [{
      context: ['/state','/events', '/session'],
      target: 'http://localhost:8003',
      changeOrigin: true
    }],
    stats: 'minimal',
    clientLogLevel: 'warning'
  },
  // https://webpack.js.org/configuration/devtool/
  devtool: 'eval-source-map',
  // devtool: isProduction ? 'hidden-source-map' : 'cheap-module-eval-source-map',
  node: {
    // workaround for webpack-dev-server issue
    // https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
    fs: 'empty',
    net: 'empty'
  }
}
