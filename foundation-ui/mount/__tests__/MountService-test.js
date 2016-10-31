jest.dontMock('../MountPoint');
jest.dontMock('../MountService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const MountPoint = require('../MountPoint');
const MountService = require('../MountService');

describe('MountService', function () {

  xdescribe('hooks', function () {

    beforeEach(function () {
      this.registerAction = jasmine.createSpy('registerAction');
      this.listenerAction = jasmine.createSpy('listenerAction');
      MountService.registerComponent('foo', this.registerAction, 11);
      MountService.addListener('foo', this.listenerAction, 11);
    });

    afterEach(function () {
      MountService.removeListener('foo', this.listenerAction);
      MountService.unregisterComponent('foo', this.registerAction);
    });

    it('calls registered filter when getContent is called', function () {
      MountService.getContent('foo', <h1>bar</h1>, {foo: 'bar'});
      expect(this.registerAction).toHaveBeenCalledWith(<h1>bar</h1>, {foo: 'bar'});
    });

    it('doesn\'t call filter when not registered anymore', function () {
      MountService.unregisterComponent('foo', this.registerAction);
      MountService.getContent('foo', <h1>bar</h1>, {foo: 'bar'});
      expect(this.registerAction).not.toHaveBeenCalled();
    });

    it('calls action when something registers', function () {
      MountService.registerComponent('foo', this.registerAction, 10);
      expect(this.listenerAction).toHaveBeenCalled();
    });

    it('calls action when something unregisters', function () {
      MountService.unregisterComponent('foo', this.registerAction, 10);
      expect(this.listenerAction).toHaveBeenCalled();
    });

    it('doesn\'t call action before anything registers or unregisters', function () {
      expect(this.listenerAction).not.toHaveBeenCalled();
    });

  });

  xdescribe('MountPoint', function () {

    beforeEach(function () {
      this.getReplacement = function getReplacement() {
        return <h2>bar</h2>;
      };
      this.getNonElement = function getNonElement() {
        return {foo: 'bar'};
      };
    });

    afterEach(function () {
      MountService.unregisterComponent('foo', this.getReplacement);
      MountService.unregisterComponent('foo', this.getNonElement);
    });

    it('should render replacement', function () {
      var result = TestUtils.renderIntoDocument(
        <MountPoint id="foo">
          <h1>foo</h1>
        </MountPoint>
      );

      MountService.registerComponent('foo', this.getReplacement);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
        .toEqual(1);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(0);
    });

    it('should restore default after unregister is called', function () {
      var result = TestUtils.renderIntoDocument(
        <MountPoint id="foo">
          <h1>foo</h1>
        </MountPoint>
      );

      MountService.registerComponent('foo', this.getReplacement);
      MountService.unregisterComponent('foo', this.getReplacement);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
        .toEqual(0);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(1);
    });

    it('should throw when filter doesn\'t yield a valid element', function () {
      var registerAndGetContent = function () {
        MountService.registerComponent('foo', this.getNonElement);
        MountService.getContent('foo');
      };

      expect(registerAndGetContent).toThrow();
    });

  });

});
