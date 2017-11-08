/* eslint-disable no-unused-vars */
const React = require("react");
const ReactDOM = require("react-dom");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const ConfigurationMapBooleanValue = require("../ConfigurationMapBooleanValue");

describe("ConfigurationMapBooleanValue", function() {
  it("show the default value for `true`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapBooleanValue value={true} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("Enabled");
  });

  it("show the default value for `false`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapBooleanValue value={false} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("Disabled");
  });

  it("show the custom value for `true`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapBooleanValue
        options={{ truthy: "foo", falsy: "bar" }}
        value={true}
      />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("foo");
  });

  it("show the custom value for `false`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapBooleanValue
        options={{ truthy: "foo", falsy: "bar" }}
        value={false}
      />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("bar");
  });

  it("show the `defaultValue` if missing", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapBooleanValue value={null} defaultValue="-" />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("-");
  });
});
