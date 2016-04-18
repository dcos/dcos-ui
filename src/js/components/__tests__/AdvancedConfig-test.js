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

  describe('#isMobileWidth', function () {
    it('returns false if element is above mobile width', function () {
      var element = {innerWidth: 100000000};
      expect(this.instance.isMobileWidth(element)).toEqual(false);
    });

    it('returns true if element is above mobile width', function () {
      var element = {innerWidth: 10};
      expect(this.instance.isMobileWidth(element)).toEqual(true);
    });
  });
});
