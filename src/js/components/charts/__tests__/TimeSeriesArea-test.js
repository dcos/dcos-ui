import d3 from "d3";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { mount } from "enzyme";

const MockTimeSeriesData = require("./fixtures/MockTimeSeriesData.json");
const TimeSeriesArea = require("../TimeSeriesArea");

function checkPath(instance, props) {
  var area = instance.find(".area");

  var index = 1;
  var points = area.getDOMNode().attributes.d.value.split(",");
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

let thisProps,
  thisAreaDef,
  thisArea,
  thisValueLineDef,
  thisValueLine,
  thisInstance;

describe("TimeSeriesArea", function() {
  beforeEach(function() {
    thisProps = {
      values: MockTimeSeriesData.firstSet
    };

    thisAreaDef = d3.svg
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
    thisArea = thisAreaDef(thisProps.values);

    thisValueLineDef = d3.svg
      .line()
      .x(function(d) {
        return d.date;
      })
      .y(function(d) {
        return d.y;
      })
      .interpolate("monotone");
    thisValueLine = thisValueLineDef(thisProps.values);

    thisInstance = mount(
      <TimeSeriesArea
        line={thisValueLine}
        path={thisArea}
        position={[-10, 0]}
        transitionTime={10}
      />
    );
  });

  it("renders a path according to first data set", function() {
    checkPath(thisInstance, thisProps);
  });

  it("renders a path according to second data set", function() {
    thisProps.values = MockTimeSeriesData.secondSet;
    var area = thisAreaDef(thisProps.values);
    var valueLine = thisValueLineDef(thisProps.values);

    thisInstance = mount(
      <TimeSeriesArea
        line={valueLine}
        path={area}
        position={[-10, 0]}
        transitionTime={10}
      />
    );

    checkPath(thisInstance, thisProps);
  });

  it("checks that the path is correctly updated", function() {
    checkPath(thisInstance, thisProps);
    thisProps.values = MockTimeSeriesData.secondSet;
    var area = thisAreaDef(thisProps.values);
    var valueLine = thisValueLineDef(thisProps.values);

    thisInstance.setProps({ line: valueLine, path: area });

    checkPath(thisInstance, thisProps);
  });
});
