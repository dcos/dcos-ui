import React from "react";
import { mount } from "enzyme";

const ConfigurationMapBooleanValue = require("../ConfigurationMapBooleanValue");

describe("ConfigurationMapBooleanValue", function() {
  it("shows the default value for `true`", function() {
    const instance = mount(<ConfigurationMapBooleanValue value={true} />);

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("Enabled");
  });

  it("shows the default value for `false`", function() {
    const instance = mount(<ConfigurationMapBooleanValue value={false} />);

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("Disabled");
  });

  it("shows the custom value for `true`", function() {
    const instance = mount(
      <ConfigurationMapBooleanValue
        options={{ truthy: "foo", falsy: "bar" }}
        value={true}
      />
    );

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("foo");
  });

  it("shows the custom value for `false`", function() {
    const instance = mount(
      <ConfigurationMapBooleanValue
        options={{ truthy: "foo", falsy: "bar" }}
        value={false}
      />
    );

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("bar");
  });

  it("shows the `defaultValue` if missing", function() {
    const instance = mount(
      <ConfigurationMapBooleanValue value={null} defaultValue="-" />
    );

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("-");
  });
});
