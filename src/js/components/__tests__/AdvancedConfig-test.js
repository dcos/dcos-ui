jest.dontMock('../AdvancedConfig');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var TestUtils = require('react-addons-test-utils');

var AdvancedConfig = require('../AdvancedConfig');

describe('AdvancedConfig', function () {
  beforeEach(function () {
    this.instance = TestUtils.renderIntoDocument(
      <AdvancedConfig />
    );
  });

  afterEach(function () {
    this.instance.state = {reviewingConfig: false};
  });

});
