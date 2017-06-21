// Transform our es6 webpack.dev.babel.js so we can use it in ../jest/preprocessor.js
require("babel-register")({
  presets: ["es2015"]
});

module.exports = require("./webpack.dev.babel.js");
