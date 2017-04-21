jest.dontMock("../TimeSeriesLabel");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TimeSeriesLabel = require("../TimeSeriesLabel");

describe("TimeSeriesLabel", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <TimeSeriesLabel colorIndex={2} currentValue="10" subHeading="Foo" />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it("should display the correct label", function() {
    // Verify that percentage is set correctly
    var title = TestUtils.findRenderedDOMComponentWithClass(
      this.instance,
      "unit"
    );
    expect(ReactDOM.findDOMNode(title).textContent).toEqual("10%");
  });

  it("should display the correct sub heading", function() {
    // Verify that percentage is set correctly
    var label = TestUtils.findRenderedDOMComponentWithClass(
      this.instance,
      "unit-label"
    );
    expect(ReactDOM.findDOMNode(label).textContent).toBe("Foo");
  });

  it("should set sub heading text color", function() {
    // Verify that percentage is set correctly
    var label = TestUtils.findRenderedDOMComponentWithClass(
      this.instance,
      "path-color-2"
    );
    expect(typeof label).toBe("object");
  });
});
