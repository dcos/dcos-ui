import React from "react";
import { shallow } from "enzyme";

const BreadcrumbSegmentLink = require("../BreadcrumbSegmentLink");

describe("BreadcrumbSegmentLink", function() {
  it("renders the label", function() {
    const instance = shallow(<BreadcrumbSegmentLink label="foo" />);

    expect(instance.find("span").text()).toEqual("foo");
  });
});
