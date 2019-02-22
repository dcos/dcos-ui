const fs = require("fs");

/**
 * List of root (test path) directories
 *
 * @description Jest will only search for tests and
 * load manual mocks (e.g. `src/__mocks__/fs.js`) within these directories.
 *
 * @type {Array.<string>}
 */
const roots = ["./src", "./tests"];

/**
 * List of package directories
 *
 * @description Packages (subdirectories)  within these directories are
 * going to be added as a "root" directory; this allows packages to roll
 * their own "manual" mocks (e.g., `my-package/__mocks__/fs.js`),
 * as Jest only loads them from root directories.
 *
 * @type {Array.<string>}
 */
const packages = ["plugins", "packages"];

// Add `npm_config_externalplugins` and strip trailing slash
// to make sure the paths are compatible.
if (process.env.npm_config_externalplugins) {
  packages.push(process.env.npm_config_externalplugins.replace(/\/$/, ""));
}

// Traverse the subdirectories for every package directory and add the
// directories to the list root directories.
packages.forEach(function(packageDir) {
  fs.readdirSync(packageDir).forEach(function(rootDir) {
    const relativePath = packageDir + "/" + rootDir;
    if (fs.statSync(relativePath).isDirectory()) {
      roots.push("./" + relativePath);
    }
  });
});

module.exports = {
  verbose: true,
  testURL: "http://localhost/",
  roots,
  globals: {
    __DEV__: true,
    "ts-jest": {
      useBabelrc: true
    }
  },
  // TODO: split up transforms
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    ".*": "./jest/preprocessor.js"
  },
  setupTestFrameworkScriptFile: "./jest/setupTestFramework.js",
  setupFiles: ["./jest/setupEnv.js"],
  testRegex: "/__tests__/.*\\-test\\.(es6|js|ts)$",
  moduleFileExtensions: ["js", "json", "es6", "ts", "tsx"],
  modulePathIgnorePatterns: ["/tmp/", "/node_modules/", "/.module-cache/"],
  moduleNameMapper: {
    "@extension-kid/notification-service":
      "<rootDir>/packages/@extension-kid/notification-service",
    "#SRC/([^\\.]*)$": "<rootDir>/src/$1",
    "#PLUGINS/([^\\.]*)$": "<rootDir>/plugins/$1",
    "#EXTERNAL_PLUGINS/([^\\.]*)$": "<rootDir>/../dcos-ui-plugins-private/$1"
  },
  timers: "fake",
  coverageReporters: ["json", "lcov", "cobertura", "text"],
  testPathIgnorePatterns: ["/tmp/", "/node_modules/"]
};
