jest.dontMock('../MountPoint');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const JestUtil = require('../../../src/js/utils/JestUtil');
const MountPoint = require('../MountPoint');

describe('MountPoint', function () {

  it('should render the children by default', function () {
    var result = JestUtil.renderAndFindTag((
      <MountPoint mountId="foo">
        <h1>foo</h1>
      </MountPoint>
    ), 'h1');

    expect(TestUtils.isDOMComponent(result)).toEqual(true);
  });

  it('should be able to render without children', function () {
    var result = JestUtil.renderAndFindTag((
      <MountPoint mountId="foo" />
    ), 'div');

    expect(TestUtils.isDOMComponent(result)).toEqual(true);
  });

  it('should not wrap a single child', function () {
    var result = TestUtils.renderIntoDocument(
      <MountPoint mountId="foo">
        <h1>foo</h1>
      </MountPoint>
    );

    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV'))
      .toEqual([]);
  });

  it('should wrap multiple children', function () {
    var result = TestUtils.renderIntoDocument(
      <MountPoint mountId="foo">
        <h1>foo</h1>
        <h2>bar</h2>
      </MountPoint>
    );

    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV').length)
      .toEqual(1);
  });

  it('should wrap single child with alwaysWrap=true', function () {
    var result = TestUtils.renderIntoDocument(
      <MountPoint mountId="foo" alwaysWrap={true}>
        <h1>foo</h1>
      </MountPoint>
    );

    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV').length)
      .toEqual(1);
  });

  it('should wrap children in passed down wrapperComponent', function () {
    var result = TestUtils.renderIntoDocument(
      <MountPoint mountId="foo" wrapperComponent="span" alwaysWrap={true}>
        <h1>foo</h1>
      </MountPoint>
    );

    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'SPAN').length)
      .toEqual(1);
    expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV').length)
      .toEqual(0);
  });

  describe('MountChain', function () {

    it('should gather contexts down the mountChain', function () {
      var instance = TestUtils.renderIntoDocument(
        <MountPoint mountId="foo">
          <MountPoint mountId="bar">
            <MountPoint mountId="baz" alwaysWrap={true} wrapperComponent="h1" />
          </MountPoint>
        </MountPoint>
      );
      var results = TestUtils.scryRenderedComponentsWithType(instance, MountPoint);

      expect(results[2].context.mountChain).toEqual(['foo', 'bar']);
    });

  });

});
