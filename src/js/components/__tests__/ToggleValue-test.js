import React from "react";
import { shallow } from "enzyme";

const ToggleValue = require("../ToggleValue");

describe("ToggleValue", function() {
  it("render the initial text value", function() {
    const instance = shallow(
      <ToggleValue primaryValue="primary" secondaryValue="secondary" />
    );

    const content = instance.find(".toggle-value");
    expect(content.html()).toContain("primary");
  });

  it("render the toggled text value after clicked", function() {
    const instance = shallow(
      <ToggleValue primaryValue="primary" secondaryValue="secondary" />
    );

    instance.find(".toggle-value").simulate("click");
    expect(instance.find(".toggle-value").html()).toContain("secondary");
  });
});
