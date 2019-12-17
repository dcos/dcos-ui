import * as React from "react";
import { shallow } from "enzyme";

import ToggleValue from "../ToggleValue";

describe("ToggleValue", () => {
  it("render the initial text value", () => {
    const instance = shallow(
      <ToggleValue primaryValue="primary" secondaryValue="secondary" />
    );

    const content = instance.find(".toggle-value");
    expect(content.html()).toContain("primary");
  });

  it("render the toggled text value after clicked", () => {
    const instance = shallow(
      <ToggleValue primaryValue="primary" secondaryValue="secondary" />
    );

    instance.find(".toggle-value").simulate("click");
    expect(instance.find(".toggle-value").html()).toContain("secondary");
  });
});
