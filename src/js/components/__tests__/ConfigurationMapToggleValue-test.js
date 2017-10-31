const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const ConfigurationMapToggleValue = require("../ConfigurationMapToggleValue");

describe("ConfigurationMapToggleValue", function() {
  it("should toggle the text value when clicked", function() {
    const container = global.document.createElement("div");
    const instance = ReactDOM.render(
      <ConfigurationMapToggleValue
        primaryValue="primary"
        secondaryValue="secondary"
      />,
      container
    );
    const content = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-toggle-value"
    );

    expect(content.innerHTML).toContain("primary");

    TestUtils.Simulate.click(content);

    expect(content.innerHTML).toContain("secondary");
  });
});
