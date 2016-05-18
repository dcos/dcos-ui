jest.dontMock('../ProgressBar');
jest.dontMock('../../../mixins/InternalStorageMixin');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var ProgressBar = require('../ProgressBar');

describe('ProgressBar', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.progressbar = ReactDOM.render(
      <ProgressBar colorIndex={2} value={66} />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('has the correct precentage transform', function () {
    var bar = TestUtils.findRenderedDOMComponentWithClass(
      this.progressbar, 'bar'
    );

    expect(ReactDOM.findDOMNode(bar).style.transform).toEqual('scaleX(0.66)');
  });

  it('will recieve new property for percentage value', function () {
    this.progressbar = TestUtils.renderIntoDocument(
      <ProgressBar colorIndex={2} value={88} />
    );

    var bar = TestUtils.findRenderedDOMComponentWithClass(
      this.progressbar, 'bar'
    );

    expect(ReactDOM.findDOMNode(bar).style.transform).toEqual('scaleX(0.88)');
  });

  it('has correct color index', function () {
    var fn = TestUtils.findRenderedDOMComponentWithClass.bind(TestUtils,
      this.progressbar, 'color-2'
    );
    expect(fn).not.toThrow();
  });

});
