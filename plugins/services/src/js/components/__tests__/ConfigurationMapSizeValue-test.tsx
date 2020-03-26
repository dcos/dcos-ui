import * as React from "react";
import { mount } from "enzyme";

import ConfigurationMapSizeValue from "../ConfigurationMapSizeValue";

function getValue(instance) {
  return instance.find(".configuration-map-value").text().trim();
}

describe("ConfigurationMapSizeValue", () => {
  it("assumes default MB scale", () => {
    const instance = mount(<ConfigurationMapSizeValue value={1.234} />);

    expect(getValue(instance)).toEqual("1.23 MiB");
  });

  it("handles `scale` property", () => {
    const instance = mount(
      <ConfigurationMapSizeValue scale={1} value={1024} />
    );

    expect(getValue(instance)).toEqual("1 KiB");
  });

  it("passes down to Units.filesize the `decimals`", () => {
    const instance = mount(
      <ConfigurationMapSizeValue decimals={0} value={1.234} />
    );

    expect(getValue(instance)).toEqual("1 MiB");
  });

  it("passes down to Units.filesize the `multiplier`", () => {
    const instance = mount(
      <ConfigurationMapSizeValue multiplier={1000} value={1} />
    );

    expect(getValue(instance)).toEqual("1.05 MiB");
  });

  it("passes down to Units.filesize the `threshold`", () => {
    const instance = mount(
      <ConfigurationMapSizeValue threshold={1} value={12.345} />
    );

    expect(getValue(instance)).toEqual("0.01 GiB");
  });

  it("passes down to Units.filesize the `units`", () => {
    const instance = mount(
      <ConfigurationMapSizeValue
        units={["A", "KiA", "MiA", "GiA", "TiA", "PiA"]}
        value={1}
      />
    );

    expect(getValue(instance)).toEqual("1 MiA");
  });

  it("renders `defaultValue` if empty", () => {
    const instance = mount(
      <ConfigurationMapSizeValue defaultValue="-" value={null} />
    );

    expect(getValue(instance)).toEqual("-");
  });
});
