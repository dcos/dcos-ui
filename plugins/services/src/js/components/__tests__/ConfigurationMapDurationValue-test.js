/* eslint-disable no-unused-vars */
const React = require("react");
const ReactDOM = require("react-dom");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const ConfigurationMapDurationValue = require("../ConfigurationMapDurationValue");

describe("ConfigurationMapDurationValue", function() {
  it("assumes default millisecond scale", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapDurationValue value={1234} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("1234 ms (1 sec, 234 ms)");
  });

  it("is configured for second scale", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapDurationValue units="sec" value={130} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("130 sec (2 min, 10 sec)");
  });

  it("removes redundant components", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapDurationValue units="sec" value={30} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("30 sec");
  });

  it("renders `defaultValue` if empty", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapDurationValue defaultValue="-" value={null} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("-");
  });
});
