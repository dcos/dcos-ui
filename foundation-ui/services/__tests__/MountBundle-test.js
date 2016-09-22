jest.dontMock('../MountBundle');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const JestUtil = require('../../../src/js/utils/JestUtil');
const Mount = require('../MountBundle').Mount;
const MountService = require('../MountBundle').MountService;

describe('MountBundle', function () {

  describe('Mount', function () {

    it('should render the children by default', function () {
      var result = JestUtil.renderAndFindTag((
        <Mount mountId="foo">
          <h1>foo</h1>
        </Mount>
      ), 'h1');

      expect(TestUtils.isDOMComponent(result)).toEqual(true);
    });

    it('should be able to render without children', function () {
      var result = JestUtil.renderAndFindTag((
        <Mount mountId="foo" />
      ), 'div');

      expect(TestUtils.isDOMComponent(result)).toEqual(true);
    });

    it('should not wrap a single child', function () {
      var result = TestUtils.renderIntoDocument(
        <Mount mountId="foo">
          <h1>foo</h1>
        </Mount>
      );

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV'))
        .toEqual([]);
    });

    it('should wrap multiple children', function () {
      var result = TestUtils.renderIntoDocument(
        <Mount mountId="foo">
          <h1>foo</h1>
          <h2>bar</h2>
        </Mount>
      );

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV').length)
        .toEqual(1);
    });

    it('should wrap single child with alwaysWrap=true', function () {
      var result = TestUtils.renderIntoDocument(
        <Mount mountId="foo" alwaysWrap={true}>
          <h1>foo</h1>
        </Mount>
      );

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV').length)
        .toEqual(1);
    });

    it('should wrap children in passed down wrapperComponent', function () {
      var result = TestUtils.renderIntoDocument(
        <Mount mountId="foo" wrapperComponent="span" alwaysWrap={true}>
          <h1>foo</h1>
        </Mount>
      );

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'SPAN').length)
        .toEqual(1);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'DIV').length)
        .toEqual(0);
    });

  });

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
        <Mount mountId="foo">
          <h1>foo</h1>
        </Mount>
      );

      MountService.on('foo', this.getReplacement);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
        .toEqual(1);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(0);
    });

    it('should restore default after removeListener is called', function () {
      var result = TestUtils.renderIntoDocument(
        <Mount mountId="foo">
          <h1>foo</h1>
        </Mount>
      );

      MountService.on('foo', this.getReplacement);
      MountService.removeListener('foo', this.getReplacement);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
        .toEqual(0);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(1);
    });

  });

  describe('MountChain', function () {

    it('should gather contexts down the mountChain', function () {
      var instance = TestUtils.renderIntoDocument(
        <Mount mountId="foo">
          <Mount mountId="bar">
            <Mount mountId="baz" alwaysWrap={true} wrapperComponent="h1" />
          </Mount>
        </Mount>
      );
      var results = TestUtils.scryRenderedComponentsWithType(instance, Mount);

      expect(results[2].context.mountChain).toEqual(['foo', 'bar']);
    });

  });

});
