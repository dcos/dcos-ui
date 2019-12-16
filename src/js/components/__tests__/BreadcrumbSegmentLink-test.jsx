import React from "react";
import { shallow } from "enzyme";

import BreadcrumbSegmentLink from "../BreadcrumbSegmentLink";

describe("BreadcrumbSegmentLink", () => {
  it("renders the label", () => {
    const instance = shallow(<BreadcrumbSegmentLink label="foo" />);

    expect(instance.find("span").text()).toEqual("foo");
  });
});
