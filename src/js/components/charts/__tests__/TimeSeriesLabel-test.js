var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

jest.dontMock('../TimeSeriesLabel');
var TimeSeriesLabel = require('../TimeSeriesLabel');

describe('TimeSeriesLabel', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <TimeSeriesLabel colorIndex={2}
        currentValue="10"
        subHeading="Foo" />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('should display the correct label', function () {
    // Verify that percentage is set correctly
    var title = TestUtils.findRenderedDOMComponentWithClass(
      this.instance, 'unit'
    );
    expect(ReactDOM.findDOMNode(title).textContent).toEqual('10%');
  });

  it('should display the correct sub heading', function () {
    // Verify that percentage is set correctly
    var label = TestUtils.findRenderedDOMComponentWithClass(
      this.instance, 'unit-label'
    );
    expect(ReactDOM.findDOMNode(label).textContent).toBe('Foo');
  });

  it('should set sub heading text color', function () {
    // Verify that percentage is set correctly
    var label = TestUtils.findRenderedDOMComponentWithClass(
      this.instance, 'path-color-2'
    );
    expect(typeof label).toBe('object');
  });

});
