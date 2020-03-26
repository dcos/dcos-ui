import * as React from "react";
import { shallow, mount } from "enzyme";

import ConfigurationMapMultilineValue from "../ConfigurationMapMultilineValue";

describe("ConfigurationMapMultilineValue", () => {
  it("renders the text in a <pre> tag", () => {
    const text = "Some\nmulti-line\ntext";
    const instance = shallow(<ConfigurationMapMultilineValue value={text} />);

    const contentText = instance.find("pre").text().trim();
    expect(contentText).toEqual(text);
  });

  it("renders `defaultValue` if empty", () => {
    const instance = mount(
      <ConfigurationMapMultilineValue value={null} defaultValue="-" />
    );

    const contentText = instance.find(".configuration-map-value").text().trim();

    expect(contentText).toEqual("-");
  });
});
