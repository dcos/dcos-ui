/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const ChartStripes = require("../ChartStripes");

let thisContainer, thisInstance;

describe("ChartStripes", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <ChartStripes count={6} height={10} width={300} />,
      thisContainer
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("displays the correct number of stripes", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      thisInstance,
      "background"
    );
    expect(stripes.length).toEqual(6);
  });

  it("has correct width on each stripe", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      thisInstance,
      "background"
    );

    stripes.forEach(function(stripe) {
      expect(
        parseInt(ReactDOM.findDOMNode(stripe).attributes.width.value, 10)
      ).toEqual(25);
    });
  });

  it("has correct x value on each stripe", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      thisInstance,
      "background"
    );

    stripes.forEach(function(stripe, i) {
      expect(
        parseInt(ReactDOM.findDOMNode(stripe).attributes.x.value, 10)
      ).toEqual(25 + i * 50);
    });
  });

  it("updates to parameter change accordingly", function() {
    var stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      thisInstance,
      "background"
    );
    expect(stripes.length).toEqual(6);

    thisInstance = ReactDOM.render(
      <ChartStripes count={5} height={10} width={300} />,
      thisContainer
    );

    stripes = TestUtils.scryRenderedDOMComponentsWithClass(
      thisInstance,
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
