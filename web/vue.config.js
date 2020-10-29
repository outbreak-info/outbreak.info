// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

// let plugins = [];

// comment this to disable analyzer
// plugins.push(new BundleAnalyzerPlugin());

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/_global.scss";`
      }
    }
  },
  configureWebpack: {
    // plugins,
    optimization: {
      splitChunks: {
        chunks: "async",
        minSize: 10000,
        maxSize: 250000
      }
    }
  }
};
