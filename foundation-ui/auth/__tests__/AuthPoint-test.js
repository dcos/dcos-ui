jest.dontMock('../AuthPoint');
jest.dontMock('../AuthService');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const AuthPoint = require('../AuthPoint');
const AuthService = require('../AuthService');

describe('AuthPoint', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.returnTrue = function () { return true; };
    this.returnFalse = function () { return false; };
  });

  afterEach(function () {
    AuthService.unregister('foo', this.returnTrue);
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('should render children when authorized', function () {
    AuthService.register('foo', this.returnTrue);
    ReactDOM.render(
      <AuthPoint id="foo">
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    var result = this.container.querySelector('h1');

    expect(TestUtils.isDOMComponent(result)).toEqual(true);
  });

  it('should render replacementComponent when unauthorized', function () {
    AuthService.register('foo', this.returnFalse);
    ReactDOM.render(
      <AuthPoint id="foo" replacementComponent={<h2>bar</h2>}>
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    var result = this.container.querySelector('h2');

    expect(TestUtils.isDOMComponent(result)).toEqual(true);
  });

  it('should change defaultValue when provided', function () {
    ReactDOM.render(
      <AuthPoint id="foo" defaultValue={false}>
        <h1>foo</h1>
      </AuthPoint>,
      this.container
    );

    var result = this.container.querySelector('h1');

    expect(TestUtils.isDOMComponent(result)).toEqual(false);
  });

});
