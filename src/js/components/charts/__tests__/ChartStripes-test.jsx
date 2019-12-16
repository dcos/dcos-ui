import React from "react";
import { shallow } from "enzyme";

import ChartStripes from "../ChartStripes";

let thisInstance;

describe("ChartStripes", () => {
  beforeEach(() => {
    thisInstance = shallow(<ChartStripes count={6} height={10} width={300} />);
  });

  it("displays the correct number of stripes", () => {
    expect(thisInstance.find(".background").length).toEqual(6);
  });

  it("has correct width on each stripe", () => {
    const stripes = thisInstance.find(".background");

    stripes.forEach(stripe => {
      expect(parseInt(stripe.props().width, 10)).toEqual(25);
    });
  });

  it("has correct x value on each stripe", () => {
    const stripes = thisInstance.find(".background");

    stripes.forEach((stripe, i) => {
      expect(parseInt(stripe.props().x, 10)).toEqual(25 + i * 50);
    });
  });

  it("updates to parameter change accordingly", () => {
    let stripes = thisInstance.find(".background");
    expect(stripes.length).toEqual(6);

    thisInstance.setProps({ count: 5 });

    stripes = thisInstance.find(".background");
    expect(stripes.length).toEqual(5);

    stripes.forEach(stripe => {
      expect(parseInt(stripe.props().width, 10)).toEqual(30);
    });

    stripes.forEach((stripe, i) => {
      expect(parseInt(stripe.props().x, 10)).toEqual(30 + i * 60);
    });
  });
});
