const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const ToggleValue = require("../ToggleValue");

describe("ToggleValue", function() {
  it("render the initial text value", function() {
    const container = global.document.createElement("div");
    const instance = ReactDOM.render(
      <ToggleValue primaryValue="primary" secondaryValue="secondary" />,
      container
    );
    const content = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "toggle-value"
    );

    expect(content.innerHTML).toContain("primary");
  });

  it("render the toggled text value after clicked", function() {
    const container = global.document.createElement("div");
    const instance = ReactDOM.render(
      <ToggleValue primaryValue="primary" secondaryValue="secondary" />,
      container
    );
    const content = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "toggle-value"
    );

    TestUtils.Simulate.click(content);
    expect(content.innerHTML).toContain("secondary");
  });
});
