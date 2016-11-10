// Simple proxy that just compiles "updateSchema.babel" to es5
require('babel-register')({
  plugins: ['transform-async-to-generator']
});

module.exports = require('./updateSchema.babel');
