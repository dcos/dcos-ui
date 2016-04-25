/*
  Generates configuration for jest.
 */
var fs = require('fs');
var path = require('path');
var pluginsFolder = process.env.DCOS_UI_PLUGINS;
var testPaths = ['src'];
if (pluginsFolder) {
  try {
    require('../' + pluginsFolder);
    testPaths.push(pluginsFolder);
  } catch (err) {
    // No plugins
  }
}

var config = {
  'testDirectoryName': '__tests__',
  'testPathDirs': testPaths,
  'globals': {
    '__DEV__': true
  },
  'scriptPreprocessor': 'jest/preprocessor.js',
  'setupTestFrameworkScriptFile': 'jest/setupTestFramework.js',
  'setupEnvScriptFile': 'jest/setupEnv.js',
  'testFileExtensions': [
    'es6',
    'js'
  ],
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
  'unmockedModulePathPatterns': [
    'babel-polyfill',
    'babel-runtime',
    'browser-info',
    'classnames',
    'd3',
    'events',
    'flux',
    'jasmine-reporters',
    'localStorage',
    'mesosphere-shared-reactjs',
    'md5',
    'mixins/index',
    'src/js/config/',
    'src/js/constants',
    'src/js/mixins/PluginGetSetMixin',
    'src/js/plugin-bridge/AppReducer',
    'src/js/plugin-bridge/Hooks',
    'src/js/plugin-bridge/middleware',
    'src/js/plugin-bridge/PluginSDK',
    'src/js/plugin-bridge/PluginTestUtils',
    'src/js/structs',
    'src/js/utils',
    'plugins',
    'react',
    'reactjs-components',
    'reactjs-mixin',
    'react-router',
    'redux',
    'underscore'
  ],
  'testPathIgnorePatterns': [
    '/tmp/',
    '/node_modules/'
  ]
};

fs.writeFileSync(
  path.resolve(__dirname, 'config.json'), JSON.stringify(config, null, 2)
);
