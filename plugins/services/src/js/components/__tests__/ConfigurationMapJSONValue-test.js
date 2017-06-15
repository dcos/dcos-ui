jest.dontMock("../ConfigurationMapJSONValue");
jest.dontMock("../../../../../../src/js/components/ConfigurationMapValue");
/* eslint-disable no-unused-vars */
const React = require("react");
const ReactDOM = require("react-dom");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const ConfigurationMapJSONValue = require("../ConfigurationMapJSONValue");

describe("ConfigurationMapJSONValue", function() {
  it("should correctly render the text in a <pre> tag", function() {
    var obj = { a: "some", b: { object: true } };
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapJSONValue value={obj} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithTag(
      instance,
      "pre"
    ).textContent.trim();

    expect(contentText).toEqual(JSON.stringify(obj, null, 2));
  });

  it("should render `defaultValue` if empty", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapJSONValue value={null} defaultValue="-" />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("-");
  });
});
