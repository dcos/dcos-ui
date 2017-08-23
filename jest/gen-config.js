/*
  Generates configuration for jest.
 */
var fs = require('fs');
var path = require('path');
var testPaths = ['src', 'plugins', 'tests', 'packages'];

if (process.env.npm_config_externalplugins) {
  testPaths.push(process.env.npm_config_externalplugins);
}

var config = {
  'testPathDirs': testPaths,
  'globals': {
    '__DEV__': true
  },
  'scriptPreprocessor': 'jest/preprocessor.js',
  'setupTestFrameworkScriptFile': 'jest/setupTestFramework.js',
  'setupFiles': ['jest/setupEnv.js'],
  'testRegex': '/__tests__/.*\\-test\\.(es6|js)$',
  'moduleFileExtensions': [
    'js',
    'json',
    'es6'
  ],
  'modulePathIgnorePatterns': [
    '/tmp/',
    '/node_modules/',
    '/.module-cache/'
  ],
  'timers': 'fake',
  'coverageReporters': ["json", "lcov", "cobertura", "text"],
  // We need this to override jest's default ['/node_modules/']
  'preprocessorIgnorePatterns' : [],
  'testPathIgnorePatterns': [
    '/tmp/',
    '/node_modules/'
  ]
};

fs.writeFileSync(
  path.resolve(__dirname, 'config.json'), JSON.stringify(config, null, 2)
);
