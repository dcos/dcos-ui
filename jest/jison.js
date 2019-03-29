const jison = require("jison");

module.exports = {
  process: (src, _filename) => new jison.Generator(src).generate()
};
