jest.dontMock('../MountPoint');
jest.dontMock('../MountService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const MountPoint = require('../MountPoint');
const MountService = require('../MountService');

describe('MountService', function () {

  beforeEach(function () {
    this.getReplacement = function getReplacement() {
      return <h2>bar</h2>;
    };
  });

  afterEach(function () {
    MountService.removeListener('foo', this.getReplacement);
  });

  it('should render replacement', function () {
    var result = TestUtils.renderIntoDocument(
      <MountPoint id="foo">
        <h1>foo</h1>
      </MountPoint>
    );

    MountService.on('foo', this.getReplacement);

    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
      .toEqual(1);
    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
      .toEqual(0);
  });

  it('should restore default after removeListener is called', function () {
    var result = TestUtils.renderIntoDocument(
      <MountPoint id="foo">
        <h1>foo</h1>
      </MountPoint>
    );

    MountService.on('foo', this.getReplacement);
    MountService.removeListener('foo', this.getReplacement);

    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
      .toEqual(0);
    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
      .toEqual(1);
  });

});
