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
    "^.+\\.jsx?$": "ts-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
  setupFilesAfterEnv: ["./jest/setupTestFramework.ts"],
  setupFiles: ["./jest/setupEnv.ts"],
  testRegex: "/__tests__/.*\\-test\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  modulePathIgnorePatterns: ["/tmp/", "/node_modules/", "/.module-cache/"],
  moduleNameMapper: {
    "#EXTERNAL_PLUGINS/([^\\.]*)$": "<rootDir>/plugins-ee/$1",
    "\\.(jpe?g|png|gif|bmp|svg|less|raml)$": "<rootDir>/jest/fileMock.ts"
  },
  timers: "fake",
  coverageReporters: ["json", "lcov", "cobertura", "text"],
  testPathIgnorePatterns: ["/tmp/", "/node_modules/"]
};
