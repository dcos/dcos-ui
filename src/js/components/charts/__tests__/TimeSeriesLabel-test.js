/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { shallow } from "enzyme";

const TimeSeriesLabel = require("../TimeSeriesLabel");

let thisInstance;

describe("TimeSeriesLabel", function() {
  beforeEach(function() {
    thisInstance = shallow(
      <TimeSeriesLabel colorIndex={2} currentValue="10" subHeading="Foo" />
    );
  });

  it("displays the correct label", function() {
    // Verify that percentage is set correctly
    expect(thisInstance.find(".unit").text()).toEqual("10%");
  });

  it("displays the correct sub heading", function() {
    // Verify that percentage is set correctly
    expect(thisInstance.find(".unit-label").text()).toEqual("Foo");
  });

  it("sets sub heading text color", function() {
    // Verify that percentage is set correctly
    expect(thisInstance.hasClass("path-color-2"));
  });
});
