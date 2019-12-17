import * as React from "react";
import { mount } from "enzyme";

import ConfigurationMapBooleanValue from "../ConfigurationMapBooleanValue";

describe("ConfigurationMapBooleanValue", () => {
  it("shows the default value for `true`", () => {
    const instance = mount(<ConfigurationMapBooleanValue value={true} />);

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("Enabled");
  });

  it("shows the default value for `false`", () => {
    const instance = mount(<ConfigurationMapBooleanValue value={false} />);

    const contentText = instance
      .find(".configuration-map-value")
      .text()
      .trim();

    expect(contentText).toEqual("Disabled");
  });

  it("shows the custom value for `true`", () => {
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

  it("shows the custom value for `false`", () => {
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

  it("shows the `defaultValue` if missing", () => {
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
