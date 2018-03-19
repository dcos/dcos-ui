import React from "react";
import { mount } from "enzyme";

const ConfigurationMapValueWithDefault = require("../ConfigurationMapValueWithDefault");

describe("ConfigurationMapValueWithDefault", function() {
  it("renders value if specified", function() {
    const instance = mount(<ConfigurationMapValueWithDefault value={"foo"} />);

    expect(instance.find(".configuration-map-value").text().trim()).toEqual(
      "foo"
    );
  });

  it("renders `defaultValue` if empty", function() {
    const instance = mount(
      <ConfigurationMapValueWithDefault value={null} defaultValue="-" />
    );

    expect(instance.find(".configuration-map-value").text().trim()).toEqual(
      "-"
    );
  });
});
