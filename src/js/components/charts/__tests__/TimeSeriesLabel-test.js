/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const TimeSeriesLabel = require("../TimeSeriesLabel");

let thisContainer, thisInstance;

describe("TimeSeriesLabel", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <TimeSeriesLabel colorIndex={2} currentValue="10" subHeading="Foo" />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("displays the correct label", function() {
    // Verify that percentage is set correctly
    var title = TestUtils.findRenderedDOMComponentWithClass(
      thisInstance,
      "unit"
    );
    expect(ReactDOM.findDOMNode(title).textContent).toEqual("10%");
  });

  it("displays the correct sub heading", function() {
    // Verify that percentage is set correctly
    var label = TestUtils.findRenderedDOMComponentWithClass(
      thisInstance,
      "unit-label"
    );
    expect(ReactDOM.findDOMNode(label).textContent).toBe("Foo");
  });

  it("sets sub heading text color", function() {
    // Verify that percentage is set correctly
    var label = TestUtils.findRenderedDOMComponentWithClass(
      thisInstance,
      "path-color-2"
    );
    expect(typeof label).toBe("object");
  });
});
