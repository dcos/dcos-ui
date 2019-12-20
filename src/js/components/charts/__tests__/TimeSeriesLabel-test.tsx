import * as React from "react";

import { shallow } from "enzyme";

import TimeSeriesLabel from "../TimeSeriesLabel";

let thisInstance;

describe("TimeSeriesLabel", () => {
  beforeEach(() => {
    thisInstance = shallow(
      <TimeSeriesLabel colorIndex={2} currentValue="10" subHeading="Foo" />
    );
  });

  it("displays the correct label", () => {
    // Verify that percentage is set correctly
    expect(thisInstance.find(".unit").text()).toEqual("10%");
  });

  it("displays the correct sub heading", () => {
    // Verify that percentage is set correctly
    expect(thisInstance.find(".unit-label").text()).toEqual("Foo");
  });

  it("sets sub heading text color", () => {
    // Verify that percentage is set correctly
    expect(thisInstance.hasClass("path-color-2"));
  });
});
