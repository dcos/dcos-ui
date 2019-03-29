const glob = require("glob");

// Return directories within the given path.
const dirs = path => (path ? glob.sync(`${path}/*/`) : []);

/**
 * List of root (test path) directories
 *
 * Jest will only search for tests and load manual mocks
 * (e.g. `src/__mocks__/fs.js`) within these directories.
 */
const roots = ["./src", "./tests"].concat(
  dirs("./plugins"),
  dirs("./packages"),
  dirs(process.env.npm_config_externalplugins)
);

module.exports = {
  verbose: true,
  testURL: "http://localhost/",
  globals: {
    __DEV__: true,
    "ts-jest": {
      useBabelrc: true
    }
  },
  roots,
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jison?$": "./jest/jison.js"
  },
  setupTestFrameworkScriptFile: "./jest/setupTestFramework.js",
  setupFiles: ["./jest/setupEnv.js"],
  testRegex: "/__tests__/.*\\-test\\.(js|ts)$",
  moduleFileExtensions: ["js", "json", "ts", "tsx"],
  modulePathIgnorePatterns: ["/tmp/", "/node_modules/", "/.module-cache/"],
  moduleNameMapper: {
    "#EXTERNAL_PLUGINS/([^\\.]*)$": "<rootDir>/../dcos-ui-plugins-private/$1",
    "\\.(jpe?g|png|gif|bmp|svg|less|raml)$": "<rootDir>/jest/fileMock.js"
  },
  timers: "fake",
  coverageReporters: ["json", "lcov", "cobertura", "text"],
  testPathIgnorePatterns: ["/tmp/", "/node_modules/"]
};
