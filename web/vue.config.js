// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

// let plugins = [];

// comment this to disable analyzer
// plugins.push(new BundleAnalyzerPlugin());

process.env.VUE_APP_VERSION = require('./package.json').version;

APP_DESCRIPTION =
  'Outbreak.info explores COVID-19 and SARS-CoV-2 data with variant surveillance reports, data on cases and deaths, and a searchable research library.';
APP_TITLE = 'outbreak.info SARS-CoV-2 data explorer';

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/_global.scss";`,
      },
    },
  },
  chainWebpack: (config) => {
    const version = process.env.VUE_APP_VERSION;
    config.output
      .filename(`js/[name].[hash:8].${version}.js`)
      .chunkFilename(`js/[name].[chunkhash:8].${version}.js`);
  },
  configureWebpack: {
    // plugins,
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 10000,
        maxSize: 250000
      }
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto"
        }
      ]
    }
  }
};
