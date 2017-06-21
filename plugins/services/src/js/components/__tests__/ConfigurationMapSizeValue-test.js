jest.dontMock("../ConfigurationMapSizeValue");
jest.dontMock("../../../../../../src/js/components/ConfigurationMapValue");
/* eslint-disable no-unused-vars */
const React = require("react");
const ReactDOM = require("react-dom");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const ConfigurationMapSizeValue = require("../ConfigurationMapSizeValue");

describe("ConfigurationMapSizeValue", function() {
  it("should assume default MB scale", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue value={1.234} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("1.23 MiB");
  });

  it("should correctly handle `scale` property", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue scale={1} value={1024} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("1 KiB");
  });

  it("should correctly pass down to Units.filesize the `decimals`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue decimals={0} value={1.234} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("1 MiB");
  });

  it("should correctly pass down to Units.filesize the `multiplier`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue multiplier={1000} value={1} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("1.05 MiB");
  });

  it("should correctly pass down to Units.filesize the `threshold`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue threshold={1} value={12.345} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("0.01 GiB");
  });

  it("should correctly pass down to Units.filesize the `units`", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue
        units={["A", "KiA", "MiA", "GiA", "TiA", "PiA"]}
        value={1}
      />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("1 MiA");
  });

  it("should correctly render `defaultValue` if empty", function() {
    var instance = TestUtils.renderIntoDocument(
      <ConfigurationMapSizeValue defaultValue="-" value={null} />
    );

    var contentText = TestUtils.findRenderedDOMComponentWithClass(
      instance,
      "configuration-map-value"
    ).textContent.trim();

    expect(contentText).toEqual("-");
  });
});
