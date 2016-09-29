jest.dontMock('../AuthorizeBundle');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const Authorize = require('../AuthorizeBundle').Authorize;
const Authorization = require('../AuthorizeBundle').Authorization;

describe('AuthorizeBundle', function () {

  describe('Authorize', function () {

    beforeEach(function () {
      this.container = document.createElement('div');
      this.returnTrue = function () { return true; };
      Authorization.on('foo', this.returnTrue);
    });

    afterEach(function () {
      Authorization.removeListener('foo', this.returnTrue);
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should render children when authorized', function () {
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      var result = this.container.querySelector('h1');

      expect(TestUtils.isDOMComponent(result)).toEqual(true);
    });

    it('should render replacementComponent when unauthorized', function () {
      ReactDOM.render(
        <Authorize authId="bar" replacementComponent={<h2>bar</h2>}>
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      var result = this.container.querySelector('h2');

      expect(TestUtils.isDOMComponent(result)).toEqual(true);
    });

    it('should change defaultValue when provided', function () {
      ReactDOM.render(
        <Authorize
          authId="bar"
          defaultValue={true}>
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      var result = this.container.querySelector('h1');

      expect(TestUtils.isDOMComponent(result)).toEqual(true);
    });

  });

  describe('Authorization', function () {

    beforeEach(function () {
      this.container = document.createElement('div');
      this.authorizationHandler = jasmine.createSpy('authorizationHandler');
      Authorization.on('foo', this.authorizationHandler);
    });

    afterEach(function () {
      Authorization.removeListener('foo', this.authorizationHandler);
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should call handler', function () {
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      // Called once when rendering
      expect(this.authorizationHandler.calls.count()).toEqual(1);
    });

    it('should not call handler after removal', function () {
      // Fire doAction once before removal
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      Authorization.removeListener('foo', this.authorizationHandler);
      // Fire doAction again after removal
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      // Called once when rendering
      expect(this.authorizationHandler.calls.count()).toEqual(1);
    });

    it('should not call handler from render if removed before', function () {
      // Remove listener before rendering
      Authorization.removeListener('foo', this.authorizationHandler);
      // Fire doAction again after removal
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );
      ReactDOM.render(
        <Authorize authId="foo">
          <h1>foo</h1>
        </Authorize>,
        this.container
      );

      expect(this.authorizationHandler).not.toHaveBeenCalled();
    });

  });

});
