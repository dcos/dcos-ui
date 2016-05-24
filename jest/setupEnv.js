require('babel-polyfill');

// jsdom doesn't have support for localStorage at the moment
global.localStorage = require('localStorage');

// Tests should just mock responses for the json API
// so let's just default to a noop
var RequestUtil = require('mesosphere-shared-reactjs').RequestUtil;
RequestUtil.json = function () {};
