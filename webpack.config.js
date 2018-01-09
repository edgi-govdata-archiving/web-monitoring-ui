const autoprefixer = require('autoprefixer');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ZopfliPlugin = require('zopfli-webpack-plugin');
const webpack = require('webpack');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv.toLocaleLowerCase() === 'production';
const context = __dirname;

function removeSrcDirectory (filePath) {
  let relativePath = path.relative(context, filePath);
  if (relativePath.startsWith('src/')) {
    relativePath = relativePath.slice(4);
  }
  return relativePath;
}

module.exports = {
  context,
  devtool: isProduction ? 'source-map' : 'inline-source-map',
  entry: {
    'bundle': './src/scripts/main.jsx',
  },
  output: {
    // TODO: add hashes for production (server needs to be able to handle them)
    // filename: isProduction ? '[name]-[hash].js' : '[name].js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    sourceMapFilename: 'sourceMaps/[file].map',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /.*\.(png|svg|jpg|gif|ttc|ttf|woff|woff2|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              // TODO: add hashes for production (server needs to be able to handle them)
              name: removeSrcDirectory,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              // TODO: add hashes for production (server needs to be able to handle them)
              name: removeSrcDirectory,
            },
          },
          {
            loader: 'extract-loader',
          },
          {
            loader: 'css-loader',
            options: {
              import: false,
              sourceMap: true
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [
                autoprefixer()
              ]
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }
    ],
  },
  plugins: [
  ],
};

// Production-specific additions
if (isProduction) {
  module.exports.plugins.push(
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),
    new UglifyJsPlugin({
      test: /\.js$/i,
      parallel: true,
      sourceMap: true
    }),
    new ZopfliPlugin({
      asset: '[path].gz[query]',
      test: /\.(js|css|svg|map)$/i
    })
  );
}
