jest.dontMock('../AuthPoint');
jest.dontMock('../AuthService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');

const AuthPoint = require('../AuthPoint');
const AuthService = require('../AuthService');

describe('AuthService', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.authorizationHandler = jasmine.createSpy('authorizationHandler');
    AuthService.on('foo', this.authorizationHandler);
  });

  afterEach(function () {
    AuthService.removeListener('foo', this.authorizationHandler);
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('should call handler', function () {
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    // Called once when rendering
    expect(this.authorizationHandler.calls.count()).toEqual(1);
  });

  it('should not call handler after removal', function () {
    // Fire doAction once before removal
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    AuthService.removeListener('foo', this.authorizationHandler);
    // Fire doAction again after removal
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    // Called once when rendering
    expect(this.authorizationHandler.calls.count()).toEqual(1);
  });

  it('should not call handler from render if removed before', function () {
    // Remove listener before rendering
    AuthService.removeListener('foo', this.authorizationHandler);
    // Fire doAction again after removal
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    expect(this.authorizationHandler).not.toHaveBeenCalled();
  });

});
