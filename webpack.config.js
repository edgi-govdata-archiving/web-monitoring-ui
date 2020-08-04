const autoprefixer = require('autoprefixer');
const CompressionPlugin = require('compression-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const path = require('path');
const zopfli = require('@gfx/zopfli');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv.toLocaleLowerCase() === 'production';
const context = __dirname;

function removeSrcDirectory (filePath) {
  let relativePath = path.relative(context, filePath);
  if (relativePath.startsWith('src' + path.sep)) {
    relativePath = relativePath.slice(4);
  }
  return relativePath;
}

module.exports = {
  context,
  mode: isProduction ? 'production' : 'development',
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
        // Exclude legacy CSS from CSS modules pipeline
        exclude: [
          path.resolve(__dirname, 'src/css/styles.css'),
          path.resolve(__dirname, 'src/css/diff.css'),
          path.resolve(__dirname, 'node_modules')
        ],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
              },
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
      // TODO: remove this entire pipeline when all legacy CSS is refactored
      {
        test: /\.css$/,
        exclude: [
          path.resolve(__dirname, 'node_modules')
        ],
        // Only process legacy CSS files
        include: [
          path.resolve(__dirname, 'src/css/styles.css'),
          path.resolve(__dirname, 'src/css/diff.css')
        ],
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
        test: /node_modules\/.*\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
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
    // Strip locales from Moment.js (we only use English)
    new MomentLocalesPlugin()
  ],
};

// Production-specific additions
if (isProduction) {
  module.exports.plugins.push(
    new CompressionPlugin({
      filename: '[path].gz[query]',
      test: /\.(js|css|svg|map)$/i,
      compressionOptions: {
        numiterations: 15
      },
      algorithm (input, compressionOptions, callback) {
        return zopfli.gzip(input, compressionOptions, callback);
      }
    })
  );
}
