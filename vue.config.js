module.exports = {
  configureWebpack: {
    output: {
      libraryExport: "default",
    },
    devServer: {
      allowedHosts: [".csb.app"],
      // inline: true,
      // port: 3000
    },
  },
  productionSourceMap: false,
  css: { extract: false },
};
