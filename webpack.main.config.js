// Copyright (c) 2025, Antoine Duval
// This file is part of a source-visible project.
// See LICENSE for terms. Unauthorized use is prohibited.

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./electron/server.js",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  plugins: [],
  externals: {
    'puppeteer-extra': 'commonjs puppeteer-extra',
    'puppeteer-extra-plugin-stealth': 'commonjs puppeteer-extra-plugin-stealth',
    'puppeteer-core': 'commonjs puppeteer-core',
    'is-plain-object': 'commonjs is-plain-object'
  }
};
