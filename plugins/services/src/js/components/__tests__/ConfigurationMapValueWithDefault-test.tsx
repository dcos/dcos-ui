import * as React from "react";
import { mount } from "enzyme";

import ConfigurationMapValueWithDefault from "../ConfigurationMapValueWithDefault";

describe("ConfigurationMapValueWithDefault", () => {
  it("renders value if specified", () => {
    const instance = mount(<ConfigurationMapValueWithDefault value={"foo"} />);

    expect(instance.find(".configuration-map-value").text().trim()).toEqual(
      "foo"
    );
  });

  it("renders `defaultValue` if empty", () => {
    const instance = mount(
      <ConfigurationMapValueWithDefault value={null} defaultValue="-" />
    );

    expect(instance.find(".configuration-map-value").text().trim()).toEqual(
      "-"
    );
  });
});
