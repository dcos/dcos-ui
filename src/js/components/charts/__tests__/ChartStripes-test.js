jest.dontMock("../ChartStripes");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const ChartStripes = require("../ChartStripes");

describe("ChartStripes", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <ChartStripes count={6} height={10} width={300} />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it("should display the correct number of stripes", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      this.instance,
      "background"
    );
    expect(stripes.length).toEqual(6);
  });

  it("should have correct width on each stripe", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      this.instance,
      "background"
    );

    stripes.forEach(function(stripe) {
      expect(
        parseInt(ReactDOM.findDOMNode(stripe).attributes.width.value, 10)
      ).toEqual(25);
    });
  });

  it("should have correct x value on each stripe", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      this.instance,
      "background"
    );

    stripes.forEach(function(stripe, i) {
      expect(
        parseInt(ReactDOM.findDOMNode(stripe).attributes.x.value, 10)
      ).toEqual(25 + i * 50);
    });
  });

  it("should update to parameter change accordingly", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      this.instance,
      "background"
    );
    expect(stripes.length).toEqual(6);

    this.instance = ReactDOM.render(
      <ChartStripes count={5} height={10} width={300} />,
      this.container
    );

    stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      this.instance,
      "background"
    );
    expect(stripes.length).toEqual(5);

    stripes.forEach(function(stripe) {
      expect(
        parseInt(ReactDOM.findDOMNode(stripe).attributes.width.value, 10)
      ).toEqual(30);
    });

    stripes.forEach(function(stripe, i) {
      expect(
        parseInt(ReactDOM.findDOMNode(stripe).attributes.x.value, 10)
      ).toEqual(30 + i * 60);
    });
  });
});
