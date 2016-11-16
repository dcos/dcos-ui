jest.dontMock('../Auth');
jest.dontMock('../AuthService');
jest.dontMock('../Authorizer');
jest.dontMock('../../utils/ReactUtil');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const TestUtils = require('react-addons-test-utils');

const Auth = require('../Auth');
const AuthService = require('../AuthService');
const Authorizer = require('../Authorizer');

describe('Auth', function () {
  class Authorized extends Authorizer {}
  class Unauthorized extends Authorizer {
    /* eslint-disable no-unused-vars */
    authorize(permission) {
      return false;
    }
    /* eslint-enable no-unused-vars */
  }

  const authorized = new Authorized();
  const unauthorized = new Unauthorized();

  beforeEach(function () {
    AuthService.registerAuthorizer(authorized);
  });

  afterEach(function () {
    AuthService.unregisterAuthorizer(authorized);
    AuthService.unregisterAuthorizer(unauthorized);
  });

  it('should render the children if user is authorized', function () {
    const result = TestUtils.renderIntoDocument(
        <Auth permission="*">
          <span>foo</span>
        </Auth>
    );

    expect(TestUtils.findRenderedDOMComponentWithTag(result, 'span'))
        .toBeDefined();
  });

  it('should render null if children is undefined', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Auth permission="*"/>);

    expect(renderer.getRenderOutput()).toBe(null);
  });

  it('should render null if user is unauthorized', function () {
    const renderer = TestUtils.createRenderer();
    AuthService.registerAuthorizer(unauthorized);
    renderer.render(<Auth permission="*"/>);

    expect(renderer.getRenderOutput()).toBe(null);
  });

  it('should not wrap a single child', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <Auth permission="*">
          <span>foo</span>
        </Auth>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), 'span'))
        .toBe(true);
  });

  it('should always wrap elements if configured', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <Auth permission="*" alwaysWrap={true}>
          <span>foo</span>
        </Auth>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), 'div'))
        .toBe(true);
  });

  it('should wrap elements with provided wrapper', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(
        <Auth permission="*" wrapper="p" alwaysWrap={true}>
          <span>foo</span>
        </Auth>
    );

    expect(TestUtils.isElementOfType(renderer.getRenderOutput(), 'p'))
        .toBe(true);
  });

  it('should update if new authorizer was registered', function () {
    const renderer = TestUtils.createRenderer();
    renderer.render(<Auth permission="*" />);
    AuthService.registerAuthorizer(unauthorized);

    expect(renderer.getRenderOutput()).toBe(null);
  });

  it('should update if authorizer was unregistered', function () {
    AuthService.registerAuthorizer(unauthorized);
    const result = TestUtils.renderIntoDocument(
        <Auth permission="*">
          <span>foo</span>
        </Auth>
    );

    AuthService.unregisterAuthorizer(unauthorized);

    expect(TestUtils.findRenderedDOMComponentWithTag(result, 'span'))
        .toBeDefined();
  });

});
