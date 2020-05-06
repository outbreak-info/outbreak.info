module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/_global.scss";`
      }
    }
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: "async",
        minSize: 10000,
        maxSize: 250000
      }
    }
  }
};
