// Simple proxy that just compiles "updateSchema.babel" to es5
require('babel-register')({
  presets: ['stage-0']
});

module.exports = require('./updateSchema.babel');
