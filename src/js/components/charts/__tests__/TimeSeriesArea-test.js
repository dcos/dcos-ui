const d3 = require("d3");
/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

jest.dontMock("./fixtures/MockTimeSeriesData.json");
jest.dontMock("../../../mixins/ChartMixin");
jest.dontMock("../TimeSeriesChart");
jest.dontMock("../TimeSeriesArea");

const MockTimeSeriesData = require("./fixtures/MockTimeSeriesData.json");
const TimeSeriesArea = require("../TimeSeriesArea");

function checkPath(instance, props) {
  var area = TestUtils.findRenderedDOMComponentWithClass(instance, "area");

  var index = 1;
  var points = ReactDOM.findDOMNode(area).attributes.d.value.split(",");
  points.forEach(function(str, i) {
    // Discard values after we've been through data
    // Also parseFloat and check with index (int) to make sure we exactly
    // where we want to be
    if (index < props.values.length && parseFloat(str) === index) {
      // Pick out the value we need
      var value = Math.round(parseFloat(points[i + 1].split("S")));
      expect(value).toEqual(props.values[index].y);
      index++;
    }
  });
}

describe("TimeSeriesArea", function() {
  beforeEach(function() {
    this.props = {
      values: MockTimeSeriesData.firstSet
    };

    this.areaDef = d3.svg
      .area()
      .x(function(d) {
        return d.date;
      })
      .y0(function() {
        return 0;
      })
      .y1(function(d) {
        return d.y;
      })
      .interpolate("monotone");
    this.area = this.areaDef(this.props.values);

    this.valueLineDef = d3.svg
      .line()
      .x(function(d) {
        return d.date;
      })
      .y(function(d) {
        return d.y;
      })
      .interpolate("monotone");
    this.valueLine = this.valueLineDef(this.props.values);

    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <TimeSeriesArea
        line={this.valueLine}
        path={this.area}
        position={[-10, 0]}
        transitionTime={10}
      />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it("should render a path according to first data set", function() {
    checkPath(this.instance, this.props);
  });

  it("should render a path according to second data set", function() {
    this.props.values = MockTimeSeriesData.secondSet;
    var area = this.areaDef(this.props.values);
    var valueLine = this.valueLineDef(this.props.values);

    this.instance = ReactDOM.render(
      <TimeSeriesArea
        line={valueLine}
        path={area}
        position={[-10, 0]}
        transitionTime={10}
      />,
      this.container
    );

    checkPath(this.instance, this.props);
  });

  it("should check that the path is correctly updated", function() {
    checkPath(this.instance, this.props);
    this.props.values = MockTimeSeriesData.secondSet;
    var area = this.areaDef(this.props.values);
    var valueLine = this.valueLineDef(this.props.values);

    this.instance = ReactDOM.render(
      <TimeSeriesArea
        line={valueLine}
        path={area}
        position={[-10, 0]}
        transitionTime={10}
      />,
      this.container
    );

    checkPath(this.instance, this.props);
  });
});
