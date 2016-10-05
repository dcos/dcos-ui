jest.dontMock('../AuthPoint');
jest.dontMock('../AuthService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const AuthPoint = require('../AuthPoint');
const AuthService = require('../AuthService');

describe('AuthService', function () {

  describe('hooks', function () {

    beforeEach(function () {
      this.registerAction = jasmine.createSpy('registerAction')
        .and.callFake(function () { return true; });
      this.listenerAction = jasmine.createSpy('listenerAction');
      AuthService.register('foo', this.registerAction, 11);
      AuthService.addListener('foo', this.listenerAction, 11);
    });

    afterEach(function () {
      AuthService.removeListener('foo', this.listenerAction);
      AuthService.unregister('foo', this.registerAction);
    });

    it('calls registered filter when isAuthorized is called', function () {
      AuthService.isAuthorized('foo', false, {foo: 'bar'});
      expect(this.registerAction).toHaveBeenCalledWith(false, {foo: 'bar'});
    });

    it('doesn\'t call filter when not registered anymore', function () {
      AuthService.unregister('foo', this.registerAction);
      AuthService.isAuthorized('foo', false, {foo: 'bar'});
      expect(this.registerAction).not.toHaveBeenCalled();
    });

    it('calls action when something registers', function () {
      AuthService.register('foo', this.registerAction, 10);
      expect(this.listenerAction).toHaveBeenCalled();
    });

    it('calls action when something unregisters', function () {
      AuthService.unregister('foo', this.registerAction, 10);
      expect(this.listenerAction).toHaveBeenCalled();
    });

    it('doesn\'t call action before anything registers or unregisters', function () {
      expect(this.listenerAction).not.toHaveBeenCalled();
    });

  });

  describe('AuthPoint', function () {

    beforeEach(function () {
      this.returnFalse = function returnFalse() {
        return false;
      };
      this.getNonBoolean = function getNonBoolean() {
        return {foo: 'bar'};
      };
    });

    afterEach(function () {
      AuthService.unregister('foo', this.returnFalse);
      AuthService.unregister('foo', this.getNonBoolean);
    });

    it('should render replacement', function () {
      var result = TestUtils.renderIntoDocument(
        <AuthPoint id="foo" replacementComponent={<h2>bar</h2>}>
          <h1>foo</h1>
        </AuthPoint>
      );

      AuthService.register('foo', this.returnFalse);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
        .toEqual(1);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(0);
    });

    it('should render nothing', function () {
      var result = TestUtils.renderIntoDocument(
        <AuthPoint id="foo">
          <h1>foo</h1>
        </AuthPoint>
      );

      AuthService.register('foo', this.returnFalse);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(0);
    });

    it('should restore default after unregister is called', function () {
      var result = TestUtils.renderIntoDocument(
        <AuthPoint id="foo" replacementComponent={<h2>bar</h2>}>
          <h1>foo</h1>
        </AuthPoint>
      );

      AuthService.register('foo', this.returnFalse);
      AuthService.unregister('foo', this.returnFalse);

      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H2').length)
        .toEqual(0);
      expect(TestUtils.scryRenderedDOMComponentsWithTag(result, 'H1').length)
        .toEqual(1);
    });

    it('should throw when filter doesn\'t yield a boolean', function () {
      var registerAndCallIsAuthorized = function () {
        AuthService.register('foo', this.getNonBoolean);
        AuthService.isAuthorized('foo');
      };

      expect(registerAndCallIsAuthorized).toThrow();
    });

  });

});
