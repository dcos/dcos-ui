jest.dontMock("../ConfigurationMapMultilineValue");
jest.dontMock("../../../../../../src/js/components/ConfigurationMapValue");
/* eslint-disable no-unused-vars */
const React = require("react");
const ReactDOM = require("react-dom");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const ConfigurationMapMultilineValue = require("../ConfigurationMapMultilineValue");

describe("ConfigurationMapMultilineValue", function() {
  it("should correctly render the text in a <pre> tag", function() {
    var text = "Some\nmulti-line\ntext";
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapMultilineValue value={text} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithTag(
      instance,
      "pre"
    ).textContent.trim();

    expect(contentText).toEqual(text);
  });

  it("should render `defaultValue` if empty", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapMultilineValue value={null} defaultValue="-" />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("-");
  });
});
