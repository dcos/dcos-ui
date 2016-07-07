jest.dontMock('../SecretValue');

var PluginTestUtils = require('PluginTestUtils');
var React = require('react');
var ReactDOM = require('react-dom');

var SecretValue = require('../SecretValue');

describe('SecretValue', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <SecretValue
        hiddenValue="thisishidden"
        value="truevalue" />,
      this.container
    );
    this.node = ReactDOM.findDOMNode(this.instance);
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('should return the hidden value if hidden', function () {
    let result = this.instance.getValue();
    expect(result).toEqual('thisishidden');
  });

  it('should return the value if not hidden', function () {
    this.instance.handleVisibilityToggle();
    let result = this.instance.getValue();
    expect(result).toEqual('truevalue');
  });
});
