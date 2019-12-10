import React from "react";

import { shallow, mount } from "enzyme";

import HashMapDisplay from "../HashMapDisplay";

describe("HashMapDisplay", () => {
  it("returns null if hash is not passed", () => {
    const instance = shallow(<HashMapDisplay />);
    expect(instance.type()).toEqual(null);
  });

  it("returns null if hash is not passed with headline", () => {
    const instance = shallow(<HashMapDisplay headline="foo" />);

    expect(instance.type()).toEqual(null);
  });

  it("returns null if undefined is passed to hash", () => {
    const instance = shallow(<HashMapDisplay hash={undefined} />);

    expect(instance.type()).toEqual(null);
  });

  it("returns null if empty object is passed to hash", () => {
    const instance = shallow(<HashMapDisplay hash={{}} />);

    expect(instance.type()).toEqual(null);
  });

  it("returns a node of elements if node exists", () => {
    var instance = shallow(<HashMapDisplay hash={{ foo: "bar" }} />);

    expect(instance.find("ConfigurationMapLabel").length).toEqual(1);
    expect(instance.find("ConfigurationMapValue").length).toEqual(1);
  });

  it("returns a headline if headline string is given", () => {
    var instance = mount(
      <HashMapDisplay hash={{ foo: "bar" }} headline="baz" />
    );

    expect(instance.find("ConfigurationMapHeading").text()).toEqual("baz");
  });
});
