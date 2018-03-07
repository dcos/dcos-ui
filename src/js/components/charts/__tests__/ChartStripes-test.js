import React from "react";
import { shallow } from "enzyme";

const ChartStripes = require("../ChartStripes");

let thisInstance;

describe("ChartStripes", function() {
  beforeEach(function() {
    thisInstance = shallow(<ChartStripes count={6} height={10} width={300} />);
  });

  it("displays the correct number of stripes", function() {
    expect(thisInstance.find(".background").length).toEqual(6);
  });

  it("has correct width on each stripe", function() {
    const stripes = thisInstance.find(".background");

    stripes.forEach(function(stripe) {
      expect(parseInt(stripe.props().width, 10)).toEqual(25);
    });
  });

  it("has correct x value on each stripe", function() {
    const stripes = thisInstance.find(".background");

    stripes.forEach(function(stripe, i) {
      expect(parseInt(stripe.props().x, 10)).toEqual(25 + i * 50);
    });
  });

  it("updates to parameter change accordingly", function() {
    let stripes = thisInstance.find(".background");
    expect(stripes.length).toEqual(6);

    thisInstance.setProps({ count: 5 });

    stripes = thisInstance.find(".background");
    expect(stripes.length).toEqual(5);

    stripes.forEach(function(stripe) {
      expect(parseInt(stripe.props().width, 10)).toEqual(30);
    });

    stripes.forEach(function(stripe, i) {
      expect(parseInt(stripe.props().x, 10)).toEqual(30 + i * 60);
    });
  });
});
